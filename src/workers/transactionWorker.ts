import { inject, injectable } from "inversify";
import { AbstractWorker } from "./abstract";
import { IWorker } from "./types";
import { TYPES } from "../ioCTypes";
import { IConnection } from "../rpcConnection";

@injectable()
export class TransactionWorker extends AbstractWorker implements IWorker {
  constructor(
    @inject(TYPES.IConnection) private readonly connection: IConnection
  ) {
    super();
  }
  get name(): string {
    return "TransactionWorker";
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
