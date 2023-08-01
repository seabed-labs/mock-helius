# mock-helius

Mock Helius Webhooks for Local Development

## Usage

Expose the following env vars:

```bash
RPC_REST_URL="http://localhost:8899"
RPC_WEBSOCKET_URL="ws://localhost:8900"
SHOULD_BACKFILL_ACCOUNTS="true"
SHOULD_BACKFILL_TRANSACTIONS="true"
PROGRAM_ID="Vote111111111111111111111111111111111111111"
# Your path
ACCOUNT_WEBHOOK_URL="http://localhost:3000/account"
TRANSACTION_WEBHOOK_URL="http://localhost:3000/tx"

yarn run ts-node src/index.ts
```
