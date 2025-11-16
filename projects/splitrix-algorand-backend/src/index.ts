import { IndexerWorker } from './indexer/worker';
import { createServer, startServer } from './api/server';
import { appConfig } from './config';
import { logger } from './indexer/logger';
import prisma from './prisma/client';

async function main() {
  try {
    logger.info('Starting Splitrix Backend...');

    // Initialize Prisma
    await prisma.$connect();
    logger.info('Connected to database');

    // Start indexer worker
    const indexerWorker = new IndexerWorker();
    await indexerWorker.start();
    logger.info('Indexer worker started');

    // Create and start API server
    const app = createServer(indexerWorker);
    await startServer(appConfig.server.port);

    logger.info('Backend started successfully');

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down...');
      indexerWorker.stop();
      await prisma.$disconnect();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error('Failed to start backend:', error);
    process.exit(1);
  }
}

main();

