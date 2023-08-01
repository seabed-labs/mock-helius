import { inject, injectable } from "inversify";
import { AbstractWorker } from "./abstract";
import { IWorker } from "./types";
import { IConnection } from "../rpcConnection";
import { TYPES } from "../ioCTypes";
import { IConfig } from "../config";
import { PublicKey } from "@solana/web3.js";

@injectable()
export class AccountWorker extends AbstractWorker implements IWorker {
  private readonly programId: PublicKey;
  private readonly accountWebhookUrl: string;

  constructor(
    @inject(TYPES.IConfig) config: IConfig,
    @inject(TYPES.IConnection) private readonly connection: IConnection
  ) {
    super();
    this.programId = config.programId;
    this.accountWebhookUrl = config.accountWebhookUrl;
  }

  get name(): string {
    return "AccountWorker";
  }

  async run(): Promise<void> {
    console.log(`running ${this.name} worker`);
    return Promise.resolve();
  }

  onExitError(e: unknown): void {
    console.error(e);
    console.trace(e);
  }
}
