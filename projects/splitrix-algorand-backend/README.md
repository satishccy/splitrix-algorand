# Splitrix Backend - Custom Indexer & API Server

Backend system for Splitrix bill-splitting smart contract on Algorand. Includes a custom indexer that syncs blockchain events to MySQL and REST APIs for frontend consumption.

## Smart Contract Analysis

### Contract Logic Review

**Correct Logic:**
- ✅ Group creation with admin and member validation
- ✅ Bill creation with debtor validation and amount verification
- ✅ Netting logic to offset debts between bills
- ✅ Settlement tracking with payment transactions

### Identified Issues

1. **Missing Event Emission** (Line 188): `settle_bill` doesn't emit `BillChanged` event after updating the bill
   ```python
   # Missing after line 187:
   arc4.emit(BillChanged(bill_key=bill_key))
   ```
   **Impact**: The indexer won't detect bill settlements, causing DB to be out of sync.

2. **No Member Validation**: Neither `create_bill` nor debtors are validated against group membership
   - Payer should be a group member
   - All debtors should be group members
   **Impact**: Bills can be created with non-members, breaking group integrity.

3. **Box Storage Costs**: No MBR (Minimum Balance Requirement) handling - caller should pay for box storage
   **Impact**: Contract may fail if caller doesn't have enough balance for box storage.

4. **Integer Overflow**: While unlikely with UInt64, no explicit checks for addition overflow in amount calculations
   **Impact**: Potential overflow in edge cases with very large amounts.

5. **Group Admin Rights**: Admin role is stored but never used for access control
   **Impact**: No way to enforce admin-only operations (e.g., removing members).

### Recommended Improvements

- Add event emission in `settle_bill` method
- Add `check_is_group_member()` subroutine and validate payer/debtors in `create_bill`
- Add `@arc4.abimethod()` read-only methods to get group/bill data from chain
- Consider adding box MBR payment handling or documentation
- Add admin-only methods (e.g., remove member, delete group)

## Architecture

### Components

1. **Custom Indexer Worker**: Polls Algorand blocks, extracts contract events, syncs to MySQL
2. **REST API Server**: Express.js server providing endpoints for groups, bills, balances, analytics
3. **Database**: MySQL with Prisma ORM for data persistence

### Data Flow

```
Smart Contract → Algorand Node → Indexer Worker → MySQL → REST API → Frontend
```

## Setup

1. Install dependencies: `npm install`
2. Setup environment variables: Copy `.env.example` to `.env` and configure
3. Start MySQL: `docker-compose up -d mysql`
4. Run migrations: `npx prisma migrate dev`
5. Start services: `npm run dev`

## Environment Variables

See `.env.example` for required configuration.

## API Endpoints

### Groups
- `GET /api/groups` - List all groups (optionally filter by member address)
- `GET /api/groups/:groupId` - Get group details with members
- `GET /api/groups/:groupId/bills` - List bills in a group

### Bills
- `GET /api/bills/:billId` - Get bill details with debtors
- `GET /api/bills/user/:address` - Get all bills for a user

### Balances
- `GET /api/balances/:address` - Get all balances for a user (who owes them, who they owe)

### Analytics
- `GET /api/analytics/user/:address` - User spending analytics
- `GET /api/analytics/group/:groupId` - Group analytics (total spent, by member)

### Helpers (for contract interactions)
- `POST /api/helpers/create-bill-data` - Get formatted data for `create_bill` contract method
  - Body: `{ groupId, payer, debtors: [{ address, amount }], memo }`
  - Returns: Complete data structure with calculated netting opportunities
- `GET /api/helpers/pending-debts/:groupId/:payer` - Get pending debts for a payer in a group
- `GET /api/helpers/group-members/:groupId` - Get all members of a group

### System
- `GET /api/health` - Health check + sync status

