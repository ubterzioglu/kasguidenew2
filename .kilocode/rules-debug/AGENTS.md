# Project Debug Rules (Non-Obvious Only)

- **Script Troubleshooting**: If a script fails, ensure you ran it with `node --no-warnings=MODULE_TYPELESS_PACKAGE_JSON --env-file=.env.local --experimental-strip-types`, rather than standard `ts-node` or `npx tsx`.
- **Database Context**: `grid-sweep-store.ts` tracks where ingestion scripts left off. Resetting ingestion requires running `npm run reset:ingestion` to clear this state.
- **Client/Server Logging**: Next.js server actions are heavily used. Server errors often manifest as generic 500s in the client. Check terminal output for the real stack trace.
