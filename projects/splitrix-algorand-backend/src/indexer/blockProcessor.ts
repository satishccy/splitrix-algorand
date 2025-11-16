import algosdk from "algosdk";
import { appConfig } from "../config";
import { EventParser, ParsedEvent } from "./eventParser";
import { ChainClient } from "./chainClient";
import { handleGroupCreated } from "./handlers/groupCreated";
import { handleBillChanged } from "./handlers/billChanged";
import { logger } from "./logger";

export class BlockProcessor {
  private eventParser: EventParser;
  private chainClient: ChainClient;

  constructor(chainClient: ChainClient) {
    this.eventParser = new EventParser();
    this.chainClient = chainClient;
  }

  /**
   * Process a single block and extract contract events
   */
  async processBlock(block: algosdk.Block): Promise<void> {
    const blockRound = block.header.round;
    const transactions = block.payset || [];

    logger.debug(`Processing block ${blockRound} with ${transactions.length} transactions`);

    // Filter transactions for our contract app
    const contractTransactions = transactions.filter((txn) => {
      if (!txn.signedTxn.signedTxn.txn.applicationCall) {
        return false;
      }

      const appId = txn.signedTxn.signedTxn.txn.applicationCall.appIndex;
      return Number(appId) === appConfig.algorand.contractAppId;
    });

    if (contractTransactions.length === 0) {
      logger.debug(`No contract transactions in block ${blockRound}`);
      return;
    }

    logger.info(`Found ${contractTransactions.length} contract transactions in block ${blockRound}`);

    // Process each contract transaction
    for (const txn of contractTransactions) {
      try {
        await this.processTransaction(txn, blockRound);
      } catch (error) {
        logger.error(`Error processing transaction in block ${blockRound}:`, error);
        // Continue processing other transactions
      }
    }
  }

  /**
   * Process a single transaction and extract events
   */
  private async processTransaction(txn: algosdk.SignedTxnInBlock, blockRound: bigint): Promise<void> {
    const logs = txn.signedTxn.applyData.evalDelta?.logs || [];

    if (logs.length === 0) {
      return;
    }

    // Parse events from logs
    const events = this.eventParser.parseEvents(logs);

    if (events.length === 0) {
      logger.debug(`No events found in transaction at block ${blockRound}`);
      return;
    }

    logger.info(`Found ${events.length} events in transaction at block ${blockRound}`);

    // Process each event
    for (const event of events) {
      try {
        await this.processEvent(event, blockRound);
      } catch (error) {
        logger.error(`Error processing event in block ${blockRound}:`, error);
        throw error; // Re-throw to trigger transaction rollback
      }
    }
  }

  /**
   * Process a single event
   */
  private async processEvent(event: ParsedEvent, blockRound: bigint): Promise<void> {
    switch (event.type) {
      case "GroupCreated":
        await handleGroupCreated(event, this.chainClient, Number(blockRound));
        break;
      case "BillChanged":
        await handleBillChanged(event, this.chainClient, Number(blockRound));
        break;
      default:
        logger.warn(`Unknown event type: ${(event as any).type}`);
    }
  }
}
