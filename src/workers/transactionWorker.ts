import { inject, injectable } from "inversify";
import { AbstractWorker } from "./abstract";
import { IWorker } from "./types";
import { TYPES } from "../ioCTypes";
import { IConnection } from "../rpcConnection";
import { IConfig } from "../config";
import { PublicKey } from "@solana/web3.js";
import superagent from "superagent";
import { delay } from "../utils";

@injectable()
export class TransactionWorker extends AbstractWorker implements IWorker {
  private readonly programId: PublicKey;
  private readonly transactionWebhookUrl: string;
  private latestTxSig: string | undefined = undefined;
  private readonly shouldBackfill: boolean;

  constructor(
    @inject(TYPES.IConfig) config: IConfig,
    @inject(TYPES.IConnection) private readonly connection: IConnection
  ) {
    super();
    this.programId = config.programId;
    this.transactionWebhookUrl = config.transactionWebhookUrl;
    this.shouldBackfill = config.shouldBackfillTransactions;
  }

  get name(): string {
    return "TransactionWorker";
  }

  async run(): Promise<void> {
    console.log(`running ${this.name} worker`);
    if (!this.shouldBackfill) {
      const signatures = await this.connection.getSignaturesForAddress(
        this.programId,
        {
          limit: 1,
        }
      );
      this.latestTxSig = signatures[0]?.signature;
    }
    while (this.enabled) {
      await this.backfillToSlot();
    }
  }

  onStart(): Promise<void> {
    return Promise.resolve();
  }
  onStop(): Promise<void> {
    return Promise.resolve();
  }

  async backfillToSlot(): Promise<void> {
    const backfillUntilTxSig = this.latestTxSig;
    let shouldUpdateLastTxSig = true;
    let shouldContinue = true;
    while (shouldContinue && this.enabled) {
      const signatures = (
        await this.connection.getSignaturesForAddress(this.programId, {
          until: backfillUntilTxSig,
        })
      ).map((signatureRes) => signatureRes.signature);
      console.log(`found ${signatures.length} transactions to send`);
      await this.sendWebhook(signatures, 0, 3);
      if (shouldUpdateLastTxSig) {
        this.latestTxSig = signatures[0];
        shouldUpdateLastTxSig = false;
      }
      shouldContinue = signatures.length > 0;
    }
  }

  async sendWebhook(
    signatures: string[],
    retryCount: number,
    maxCount: number
  ): Promise<void> {
    if (retryCount >= maxCount) {
      console.log("failed to send transactions!");
      return;
    }
    const txs = await Promise.all(
      signatures.map((txSig) =>
        this.connection.getTransaction(txSig, {
          maxSupportedTransactionVersion: 0,
        })
      )
    );
    console.log(`sending ${signatures.length} transactions...`);
    try {
      await superagent.post(this.transactionWebhookUrl).send(txs);
    } catch (e) {
      console.error(e);
      console.log("failed to send transaction, retrying after 500ms");
      await delay(500);
      return this.sendWebhook(signatures, retryCount++, maxCount);
    }
  }

  onExitError(e: unknown): void {
    console.error(e);
    console.trace(e);
  }
}
