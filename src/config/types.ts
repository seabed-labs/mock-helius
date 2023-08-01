export interface IConfig {
  get rpcRestUrl(): string;
  get rpcWebsocketUrl(): string;
  get shouldBackfillAccounts(): boolean;
  get shouldBackfillTransactions(): boolean;
}
