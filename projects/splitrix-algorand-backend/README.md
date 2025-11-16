# Splitrix Backend - Custom Indexer & API Server

Backend system for the Splitrix dApp. This includes a custom indexer that syncs Algorand smart contract events to a MySQL database and a REST API server for the frontend.

## Architecture

```mermaid
graph TB

%% =========================
%% FRONTEND
%% =========================
subgraph FE[Frontend - React Application]
    FE1[Wallet Integration]
    FE2[Send Transactions to Algorand]
    FE3[Call Backend API]
end

%% =========================
%% BACKEND
%% =========================
subgraph BE[Backend - API + Custom Indexer]
    BE1[REST API]
    BE3[Custom Indexer
    Sync Blocks & Parse ARC-28 Events]
    BE4[MySQL Database]
end

%% =========================
%% SMART CONTRACT
%% =========================
subgraph SC[Smart Contract]
    SC1[Group & Bill Logic]
    SC2[Emit ARC-28 Events]
end

%% =========================
%% CONNECTIONS
%% =========================

FE1 -->|Signs Transactions| FE2
FE2 -->|Signed Transactions| SC1
SC2 -->|ARC-28 Events| BE3
BE3 -->|Store Parsed Data| BE4
FE3 <-->|Serves Offchain Data| BE1
```

### Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Wallet
    participant Frontend
    participant AlgoNode
    participant Contract
    participant Custom Indexer
    participant Backend
    participant DB

    User->>Frontend: Click "Create Bill"
    Frontend->>Frontend: Validate inputs & netting
    Frontend->>Wallet: Request signature
    Wallet->>User: Confirm transaction
    User->>Wallet: Approve
    Wallet->>Frontend: Signed transaction
    Frontend->>AlgoNode: Submit transaction
    AlgoNode->>Contract: Execute create_bill()
    Contract->>Contract: Store bill state
    Contract->>AlgoNode: Emit BillChanged event (ARC-28)
    Custom Indexer->>AlgoNode: Poll for new blocks
    Custom Indexer->>Backend: Parse BillChanged event
    Backend->>DB: Insert/Update bill record
    Backend->>Frontend: Push update (WebSocket)
    Frontend->>User: Display new bill
```

---
## 🛡️ Security & Integrity: Why Use a Custom Indexer?

The backend custom indexer is critical for Splitrix's performance and security:

- **Off-chain Computation:** Complex netting calculations and debt aggregation happen off-chain for speed.
- **Performance:** Querying blockchain state directly is slow; the indexer caches data in MySQL for instant access.
- **Queryability:** Enables complex queries (e.g., "show all unsettled bills for user X") that are impractical on-chain.
- **ARC-28 Event Listening:** Ensures on-chain integrity by listening to contract-emitted events, not trusting user input.
- **Auditability:** Every state change is traceable via events, providing a verifiable audit trail.

---

## Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```
2. **Setup environment variables**
   Copy `.env.sample` to `.env` and configure the database and Algorand node variables.
   ```bash
   cp .env.sample .env
   ```
3. **Setup Database**
   Create a MySQL database named `splitrix`.
    ```bash
    mysql -u root -p -e "CREATE DATABASE splitrix;"
    ```
4. **Run migrations**
   ```bash
   pnpm prisma:migrate
   ```
5. **Start services**
   This will start the API server and the indexer worker.
   ```bash
   pnpm dev
   ```

## Environment Variables

See `.env.sample` for required configuration. Key variables include:
- `INDEXER_URL`
- `ALGOD_URL`
- `ALGOD_TOKEN`
- `DATABASE_URL`
- `PORT`

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

