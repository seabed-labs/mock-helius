import { inject, injectable } from "inversify";
import { AbstractWorker } from "./abstract";
import { IWorker } from "./types";
import { IConnection } from "../rpcConnection";
import { TYPES } from "../ioCTypes";
import { IConfig } from "../config";
import { AccountInfo, KeyedAccountInfo, PublicKey } from "@solana/web3.js";
import superagent from "superagent";
import { delay } from "../utils";

@injectable()
export class AccountWorker extends AbstractWorker implements IWorker {
  private readonly programId: PublicKey;
  private readonly accountWebhookUrl: string;
  private readonly shouldBackfillAccounts: boolean;
  private webSocketId: number | undefined = undefined;

  constructor(
    @inject(TYPES.IConfig) config: IConfig,
    @inject(TYPES.IConnection) private readonly connection: IConnection
  ) {
    super();
    this.programId = config.programId;
    this.accountWebhookUrl = config.accountWebhookUrl;
    this.shouldBackfillAccounts = config.shouldBackfillAccounts;
  }

  get name(): string {
    return "AccountWorker";
  }

  async run(): Promise<void> {
    console.log(`running ${this.name} worker`);
    this.webSocketId = this.connection.onProgramAccountChange(
      this.programId,
      async (account: KeyedAccountInfo) => {
        this.sendWebhook(
          [
            {
              ...account.accountInfo,
              pubkey: account.accountId,
            },
          ],
          0,
          3
        );
      }
    );
    if (this.shouldBackfillAccounts) {
      await this.backfill();
    }
    return Promise.resolve();
  }

  async onStart(): Promise<void> {
    console.log(`running ${this.name} worker`);
  }

  async onStop(): Promise<void> {
    if (this.webSocketId) {
      return this.connection.removeProgramAccountChangeListener(
        this.webSocketId
      );
    }
  }

  async backfill(): Promise<void> {
    const accountKeys = (
      await this.connection.getProgramAccounts(this.programId, {
        dataSlice: { offset: 0, length: 32 },
      })
    ).map((a) => a.pubkey);
    for (let i = 0; i < accountKeys.length; i++) {
      const accountInfo = await this.connection.getAccountInfo(accountKeys[i]);
      if (!accountInfo) {
        continue;
      }
      await this.sendWebhook(
        [
          {
            ...accountInfo,
            pubkey: accountKeys[i],
          },
        ],
        0,
        3
      );
    }
  }

  async sendWebhook(
    accounts: (AccountInfo<Buffer> & { pubkey: PublicKey })[],
    retryCount: number,
    maxCount: number
  ): Promise<void> {
    if (retryCount >= maxCount) {
      console.log("failed to send accounts!");
      return;
    }
    const body = accounts.map((account) => {
      return {
        account: {
          parsed: account,
        },
      };
    });
    console.log(`sending ${accounts.length} accounts...`);
    try {
      await superagent.post(this.accountWebhookUrl).send(body);
    } catch (e) {
      console.error(e);
      console.log("failed to send account, retrying after 500ms");
      await delay(500);
      return this.sendWebhook(accounts, retryCount++, maxCount);
    }
  }

  onExitError(e: unknown): void {
    console.error(e);
    console.trace(e);
  }
}
