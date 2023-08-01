import { Connection as Web3Connection } from "@solana/web3.js";
import { IConnection } from "./types";
import { TYPES } from "../ioCTypes";
import { inject, injectable } from "inversify";
import { IConfig } from "../config";

@injectable()
export class Connection extends Web3Connection implements IConnection {
  constructor(@inject(TYPES.IConfig) config: IConfig) {
    super(config.rpcRestUrl, {
      wsEndpoint: config.rpcWebsocketUrl,
    });
  }
}
