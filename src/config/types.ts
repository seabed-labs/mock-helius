import { PublicKey } from '@solana/web3.js';

export interface IConfig {
    rpcRestUrl: string;
    rpcWebsocketUrl: string;
    shouldBackfillAccounts: boolean;
    shouldBackfillTransactions: boolean;
    accountWebhookUrl: string;
    transactionWebhookUrl: string;
    programId: PublicKey;
}
