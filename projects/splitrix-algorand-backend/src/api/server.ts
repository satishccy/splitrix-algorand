import express, { Request, Response } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import { safeJsonMiddleware } from "./middleware/safeJsonMiddleware";
import groupsRouter from "./routes/groups";
import billsRouter from "./routes/bills";
import balancesRouter from "./routes/balances";
import analyticsRouter from "./routes/analytics";
import helpersRouter from "./routes/helpers";
import friendsRouter from "./routes/friends";
import { IndexerWorker } from "../indexer/worker";
import { appConfig } from "../config";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Apply safeJson middleware to convert BigInt values in responses
app.use(safeJsonMiddleware);

// Health check endpoint
app.get("/api/health", async (req: Request, res: Response) => {
  try {
    const indexerWorker = (req.app.get("indexerWorker") as IndexerWorker) || null;
    const syncStatus = indexerWorker ? await indexerWorker.getSyncStatus() : null;

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      syncStatus: syncStatus
        ? {
            lastSyncedBlock: syncStatus.lastSyncedBlock.toString(),
            lastSyncedAt: syncStatus.lastSyncedAt.toISOString(),
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// API routes
app.use("/api/groups", groupsRouter);
app.use("/api/bills", billsRouter);
app.use("/api/balances", balancesRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/helpers", helpersRouter);
app.use("/api/friends", friendsRouter);

// Error handler
app.use(errorHandler);

export function createServer(indexerWorker?: IndexerWorker): express.Application {
  if (indexerWorker) {
    app.set("indexerWorker", indexerWorker);
  }
  return app;
}

export function startServer(port: number = appConfig.server.port): Promise<void> {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`API server listening on port ${port}`);
      resolve();
    });
  });
}
