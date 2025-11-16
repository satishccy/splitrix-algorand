# Implementation Notes

## Event Parsing

The event parser attempts to decode ARC4 events from transaction logs. ARC4 events are typically emitted as logs with the format:
- `ARC4Event` + base64(encoded_struct)

The current implementation tries to parse events by:
1. Checking for `ARC4Event` prefix in logs
2. Decoding base64 data
3. Parsing struct data based on expected structure

**Note**: The exact encoding format may vary depending on the Algorand Python SDK version and how events are emitted. You may need to adjust the parsing logic based on actual log format from your contract.

## Box Storage Reading

The `ChainClient` reads data from Algorand box storage. Currently, it fetches all boxes for the application each time, which may be inefficient for large numbers of boxes. For production, consider:
- Caching box data
- Using box name queries if supported by your Algorand node
- Implementing incremental updates

## Database Schema

The Prisma schema uses `BigInt` for amounts to handle large Algorand microAlgo values. When returning API responses, these are automatically serialized as strings in JSON.

## Sync Strategy

The indexer:
- Starts from `max(deploymentBlock, lastSyncedBlock + 1)`
- Processes blocks in batches of 100
- Updates sync status after each successful batch
- Is idempotent (skips already processed blocks)

## Error Handling

- Indexer errors are logged but don't stop the worker
- API errors are caught and returned as JSON responses
- Database transaction failures roll back automatically

## Performance Considerations

For a hackathon project, this implementation prioritizes simplicity over optimization. For production:
- Add connection pooling for database
- Implement caching for frequently accessed data
- Add rate limiting for API endpoints
- Consider using a message queue for event processing
- Add monitoring and alerting

