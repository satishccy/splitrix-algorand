# Setup Instructions

## Prerequisites

- Node.js 20+ installed
- Docker and Docker Compose installed
- MySQL 8.0 (or use Docker Compose)

## Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `ALGOD_URL`: Your Algorand node URL (e.g., `http://localhost:4001` for local node)
   - `ALGOD_TOKEN`: Algod API token
   - `CONTRACT_APP_ID`: Your deployed contract application ID
   - `CONTRACT_DEPLOYMENT_BLOCK`: Block number when contract was deployed
   - `DATABASE_URL`: MySQL connection string (e.g., `mysql://user:password@localhost:3306/splitrix`)

3. **Start MySQL Database**
   ```bash
   docker-compose up -d mysql
   ```
   
   Or use your own MySQL instance and update `DATABASE_URL` accordingly.

4. **Run Database Migrations**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start the Backend**
   ```bash
   # Development mode (with hot reload)
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## API Endpoints

Once running, the API will be available at `http://localhost:3000`:

- `GET /api/health` - Health check and sync status
- `GET /api/groups` - List all groups (query param: `?address=<wallet_address>`)
- `GET /api/groups/:groupId` - Get group details
- `GET /api/groups/:groupId/bills` - Get bills for a group
- `GET /api/bills/:billId` - Get bill details (billId format: "groupId:billId")
- `GET /api/bills/user/:address` - Get all bills for a user
- `GET /api/balances/:address` - Get balance information for a user
- `GET /api/analytics/user/:address` - Get user analytics
- `GET /api/analytics/group/:groupId` - Get group analytics

## Indexer

The indexer worker runs automatically and:
- Polls Algorand blocks every 4.5 seconds
- Processes contract events (GroupCreated, BillChanged)
- Syncs data to MySQL database
- Tracks sync status to prevent duplicate processing

## Troubleshooting

- **Database connection errors**: Ensure MySQL is running and `DATABASE_URL` is correct
- **Indexer not syncing**: Check `CONTRACT_APP_ID` and `CONTRACT_DEPLOYMENT_BLOCK` are set correctly
- **Algod connection errors**: Verify `ALGOD_URL` and `ALGOD_TOKEN` are correct

