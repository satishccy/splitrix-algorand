import prisma from '../prisma/client';
import { appConfig } from '../config';
import { ChainClient } from './chainClient';
import { BlockProcessor } from './blockProcessor';
import { logger } from './logger';

const SYNC_INTERVAL_MS = 4500; // 4.5 seconds (slightly longer than Algorand block time)

export class IndexerWorker {
  private chainClient: ChainClient;
  private blockProcessor: BlockProcessor;
  private isRunning: boolean = false;
  private syncInterval?: NodeJS.Timeout;

  constructor() {
    this.chainClient = new ChainClient();
    this.blockProcessor = new BlockProcessor(this.chainClient);
  }

  /**
   * Start the indexer worker
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Indexer worker is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting indexer worker...');

    // Initialize sync status if it doesn't exist
    await this.initializeSyncStatus();

    // Start continuous sync
    await this.syncLoop();

    // Set up interval for periodic syncing
    this.syncInterval = setInterval(() => {
      this.syncLoop().catch((error) => {
        logger.error('Error in sync loop:', error);
      });
    }, SYNC_INTERVAL_MS);
  }

  /**
   * Stop the indexer worker
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    logger.info('Indexer worker stopped');
  }

  /**
   * Initialize sync status in database
   */
  private async initializeSyncStatus(): Promise<void> {
    const syncStatus = await prisma.syncStatus.findUnique({
      where: { id: 1 },
    });

    if (!syncStatus) {
      // Start from contract deployment block or 0
      const startBlock = appConfig.algorand.contractDeploymentBlock;
      await prisma.syncStatus.create({
        data: {
          id: 1,
          lastSyncedBlock: startBlock,
        },
      });
      logger.info(`Initialized sync status at block ${startBlock}`);
    }
  }

  /**
   * Main sync loop
   */
  private async syncLoop(): Promise<void> {
    try {
      const syncStatus = await prisma.syncStatus.findUnique({
        where: { id: 1 },
      });

      if (!syncStatus) {
        throw new Error('Sync status not initialized');
      }

      const lastSyncedBlock = syncStatus.lastSyncedBlock;
      const latestBlock = await this.chainClient.getLatestBlock();

      // Determine start block (max of deployment block and last synced block + 1)
      const deploymentBlock = appConfig.algorand.contractDeploymentBlock;
      const startBlock = deploymentBlock > lastSyncedBlock 
        ? Number(deploymentBlock) 
        : Number(lastSyncedBlock) + 1;

      if (startBlock > latestBlock) {
        logger.debug(`No new blocks to sync (latest: ${latestBlock}, last synced: ${lastSyncedBlock})`);
        return;
      }

      logger.info(`Syncing blocks from ${startBlock} to ${latestBlock}`);

      // Process blocks in batches
      const batchSize = 100;
      for (let round = startBlock; round <= latestBlock; round += batchSize) {
        const endRound = Math.min(round + batchSize - 1, latestBlock);
        await this.processBlockRange(round, endRound);
      }

      // Update sync status
      await prisma.syncStatus.update({
        where: { id: 1 },
        data: {
          lastSyncedBlock: latestBlock,
        },
      });

      logger.info(`Synced up to block ${latestBlock}`);
    } catch (error) {
      logger.error('Error in sync loop:', error);
      throw error;
    }
  }

  /**
   * Process a range of blocks
   */
  private async processBlockRange(startRound: number, endRound: number): Promise<void> {
    logger.debug(`Processing blocks ${startRound} to ${endRound}`);

    for (let round = startRound; round <= endRound; round++) {
      try {
        // Check if block already processed (idempotency check)
        const syncStatus = await prisma.syncStatus.findUnique({
          where: { id: 1 },
        });

        if (syncStatus && Number(syncStatus.lastSyncedBlock) >= round) {
          logger.debug(`Block ${round} already processed, skipping`);
          continue;
        }

        // Fetch and process block
        const block = await this.chainClient.getBlock(round);
        
        // Process block in a transaction for atomicity
        await prisma.$transaction(async (tx) => {
          await this.blockProcessor.processBlock(block);
        });

        logger.debug(`Processed block ${round}`);
      } catch (error) {
        logger.error(`Error processing block ${round}:`, error);
        // Continue with next block instead of failing entire batch
      }
    }
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<{ lastSyncedBlock: number; lastSyncedAt: Date } | null> {
    const syncStatus = await prisma.syncStatus.findUnique({
      where: { id: 1 },
    });

    if (!syncStatus) {
      return null;
    }

    return {
      lastSyncedBlock: Number(syncStatus.lastSyncedBlock),
      lastSyncedAt: syncStatus.lastSyncedAt,
    };
  }
}

