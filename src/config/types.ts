import { PublicKey } from '@solana/web3.js';

export interface IConfig {
    get rpcRestUrl(): string;
    get rpcWebsocketUrl(): string;
    get shouldBackfillAccounts(): boolean;
    get shouldBackfillTransactions(): boolean;
    get accountWebhookUrl(): string;
    get transactionWebhookUrl(): string;
    get programId(): PublicKey;
}
