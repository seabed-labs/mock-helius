import assert from "assert";
import { IConfig } from "./types";
import { injectable } from "inversify";

@injectable()
export class Config implements IConfig {
  private readonly _rpcRestUrl: string;
  private readonly _rpcWebsocketUrl: string;
  private readonly _shoudBackfillAccounts: boolean;
  private readonly _shouldBackfillTransactions: boolean;

  constructor() {
    const rpcRestUrl = process.env.RPC_REST_URL;
    assert(rpcRestUrl, new Error("RPC_REST_URL env var not set"));
    this._rpcRestUrl = rpcRestUrl;
    const rpcWebsocketUrl = process.env.RPC_WEBSOCKET_URL;
    assert(rpcWebsocketUrl, new Error("RPC_WEBSOCKET_URL env var not set"));
    this._rpcWebsocketUrl = rpcWebsocketUrl;
    this._shoudBackfillAccounts = process.env.SHOULD_BACKFILL_ACCOUNTS !== "";
    this._shouldBackfillTransactions =
      process.env.SHOULD_BACKFILL_TRANSACTIONS !== "";
  }
  get shouldBackfillAccounts(): boolean {
    return this._shoudBackfillAccounts;
  }
  get shouldBackfillTransactions(): boolean {
    return this._shouldBackfillTransactions;
  }
  get rpcRestUrl(): string {
    return this._rpcRestUrl;
  }
  get rpcWebsocketUrl(): string {
    return this._rpcWebsocketUrl;
  }
}
