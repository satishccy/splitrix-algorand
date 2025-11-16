import prisma from '../../prisma/client';
import { ChainClient } from '../chainClient';
import { BillChangedEvent } from '../eventParser';
import { logger } from '../logger';

export async function handleBillChanged(
  event: BillChangedEvent,
  chainClient: ChainClient,
  blockRound: number
): Promise<void> {
  const groupId = event.billKey.groupId.toString();
  const billId = event.billKey.billId.toString();
  const billDbId = `${groupId}:${billId}`;

  try {
    // Fetch bill data from chain
    const billData = await chainClient.getBillData(
      event.billKey.groupId,
      event.billKey.billId
    );

    if (!billData) {
      logger.warn(
        `Bill data not found on chain for groupId ${groupId}, billId ${billId} at block ${blockRound}`
      );
      return;
    }

    // Upsert bill
    await prisma.bill.upsert({
      where: { id: billDbId },
      update: {
        payer: billData.payer,
        totalAmount: billData.totalAmount,
        memo: billData.memo,
      },
      create: {
        id: billDbId,
        groupId,
        billId,
        payer: billData.payer,
        totalAmount: billData.totalAmount,
        memo: billData.memo,
      },
    });

    // Delete existing debtors and recreate them
    await prisma.debtor.deleteMany({
      where: { billId: billDbId },
    });

    // Create debtors
    for (const debtor of billData.debtors) {
      await prisma.debtor.create({
        data: {
          billId: billDbId,
          address: debtor.debtor,
          amount: debtor.amount,
          paid: debtor.paid,
        },
      });
    }

    logger.info(
      `Processed BillChanged event for groupId ${groupId}, billId ${billId} at block ${blockRound}`
    );
  } catch (error) {
    logger.error(
      `Error handling BillChanged event for groupId ${groupId}, billId ${billId}:`,
      error
    );
    throw error;
  }
}

