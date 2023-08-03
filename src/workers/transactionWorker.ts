import { inject, injectable } from "inversify";
import { AbstractWorker } from "./abstract";
import { IWorker } from "./types";
import { TYPES } from "../ioCTypes";
import { IConnection } from "../rpcConnection";
import { IConfig } from "../config";
import { PublicKey } from "@solana/web3.js";
import superagent, { ResponseError } from "superagent";
import { delay, logSendError } from "../utils";

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
    console.log(this.programId.toString());
    this.transactionWebhookUrl = config.transactionWebhookUrl;
    this.shouldBackfill = config.shouldBackfillTransactions;
  }

  get name(): string {
    return "TransactionWorker";
  }

  async run(): Promise<void> {
    console.log(
      `running ${this.name} worker, shouldBackfill: ${this.shouldBackfill}`
    );
    if (!this.shouldBackfill) {
      console.log(
        "not backfilling, setting latest signature to most recent transaction"
      );
      this.latestTxSig = (
        await this.connection.getSignaturesForAddress(this.programId, {
          limit: 1,
        })
      )[0]?.signature;
    }
    while (this.enabled) {
      await this.backfillToLatestTxSig();
    }
  }

  onStart(): Promise<void> {
    return Promise.resolve();
  }
  onStop(): Promise<void> {
    return Promise.resolve();
  }

  async backfillToLatestTxSig(): Promise<void> {
    let backfillUntilTxSig = this.latestTxSig;
    let iteration = 0;
    while (this.enabled) {
      console.log(
        `fetching transactions until ${this.latestTxSig}, iteration ${iteration}`
      );
      const signatures = (
        await this.connection.getSignaturesForAddress(this.programId, {
          until: backfillUntilTxSig,
        })
      ).map((signatureRes) => signatureRes.signature);
      if (iteration === 0) {
        this.latestTxSig = signatures[0] ?? this.latestTxSig;
      }
      if (signatures.length) {
        console.log(`found ${signatures.length} transactions to send`);
        await this.sendWebhook(signatures, 0, 3);
        backfillUntilTxSig = signatures[signatures.length - 1];
        iteration += 1;
      } else {
        break;
      }
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
      logSendError(txs, e as ResponseError);
      await delay(500);
      return this.sendWebhook(signatures, retryCount + 1, maxCount);
    }
  }

  onExitError(e: unknown): void {
    console.error(e);
    console.trace(e);
  }
}
