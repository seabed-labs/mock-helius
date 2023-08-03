import assert from 'assert';

import { PublicKey } from '@solana/web3.js';
import { injectable } from 'inversify';

import { IConfig } from './types';

@injectable()
export class Config implements IConfig {
    private readonly _rpcRestUrl: string;
    private readonly _rpcWebsocketUrl: string;
    private readonly _shoudBackfillAccounts: boolean;
    private readonly _shouldBackfillTransactions: boolean;
    private readonly _accountWebhookUrl: string;
    private readonly _transactionWebhookUrl: string;
    private readonly _programId: PublicKey;

    constructor() {
        const rpcRestUrl = process.env.RPC_REST_URL;
        assert(rpcRestUrl, new Error('RPC_REST_URL env var not set'));
        this._rpcRestUrl = rpcRestUrl;

        const rpcWebsocketUrl = process.env.RPC_WEBSOCKET_URL;
        assert(rpcWebsocketUrl, new Error('RPC_WEBSOCKET_URL env var not set'));
        this._rpcWebsocketUrl = rpcWebsocketUrl;

        this._shoudBackfillAccounts =
            process.env.SHOULD_BACKFILL_ACCOUNTS !== '';
        this._shouldBackfillTransactions =
            process.env.SHOULD_BACKFILL_TRANSACTIONS !== '';

        const accountWebhookUrl = process.env.ACCOUNT_WEBHOOK_URL;
        assert(
            accountWebhookUrl,
            new Error('ACCOUNT_WEBHOOK_URL env var not set')
        );
        this._accountWebhookUrl = accountWebhookUrl;

        const transactionWebhookUrl = process.env.TRANSACTION_WEBHOOK_URL;
        assert(
            transactionWebhookUrl,
            new Error('TRANSACTION_WEBHOOK_URL env var not set')
        );
        this._transactionWebhookUrl = transactionWebhookUrl;

        const programId = process.env.PROGRAM_ID;
        assert(programId, new Error('PROGRAM_ID env var not set '));
        this._programId = new PublicKey(programId);
    }

    get accountWebhookUrl(): string {
        return this._accountWebhookUrl;
    }
    get transactionWebhookUrl(): string {
        return this._transactionWebhookUrl;
    }
    get programId(): PublicKey {
        return this._programId;
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
