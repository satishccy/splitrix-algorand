import prisma from '../prisma/client';

export interface BalanceInfo {
  address: string;
  owes: bigint; // Total amount user owes to others
  owed: bigint; // Total amount others owe to user
  netBalance: bigint; // owed - owes (positive = net creditor, negative = net debtor)
  breakdown: {
    owes: Array<{
      to: string;
      amount: bigint;
      bills: Array<{ billId: string; amount: bigint }>;
    }>;
    owed: Array<{
      from: string;
      amount: bigint;
      bills: Array<{ billId: string; amount: bigint }>;
    }>;
  };
}

export class BalancesService {
  /**
   * Get balance information for a user
   */
  async getBalances(address: string): Promise<BalanceInfo> {
    // Get all bills where user is a debtor
    const debtorBills = await prisma.debtor.findMany({
      where: { address },
      include: {
        bill: true,
      },
    });

    // Get all bills where user is the payer
    const payerBills = await prisma.bill.findMany({
      where: { payer: address },
      include: {
        debtors: true,
      },
    });

    // Calculate what user owes (as debtor)
    const owesMap = new Map<string, { amount: bigint; bills: Array<{ billId: string; amount: bigint }> }>();
    let totalOwes = BigInt(0);

    for (const debtor of debtorBills) {
      const pending = debtor.amount - debtor.paid;
      if (pending > 0) {
        const bill = debtor.bill;
        const payer = bill.payer;

        if (!owesMap.has(payer)) {
          owesMap.set(payer, { amount: BigInt(0), bills: [] });
        }

        const entry = owesMap.get(payer)!;
        entry.amount += pending;
        entry.bills.push({
          billId: bill.id,
          amount: pending,
        });
        totalOwes += pending;
      }
    }

    // Calculate what others owe user (as payer)
    const owedMap = new Map<string, { amount: bigint; bills: Array<{ billId: string; amount: bigint }> }>();
    let totalOwed = BigInt(0);

    for (const bill of payerBills) {
      for (const debtor of bill.debtors) {
        const pending = debtor.amount - debtor.paid;
        if (pending > 0) {
          if (!owedMap.has(debtor.address)) {
            owedMap.set(debtor.address, { amount: BigInt(0), bills: [] });
          }

          const entry = owedMap.get(debtor.address)!;
          entry.amount += pending;
          entry.bills.push({
            billId: bill.id,
            amount: pending,
          });
          totalOwed += pending;
        }
      }
    }

    return {
      address,
      owes: totalOwes,
      owed: totalOwed,
      netBalance: totalOwed - totalOwes,
      breakdown: {
        owes: Array.from(owesMap.entries()).map(([to, data]) => ({
          to,
          amount: data.amount,
          bills: data.bills,
        })),
        owed: Array.from(owedMap.entries()).map(([from, data]) => ({
          from,
          amount: data.amount,
          bills: data.bills,
        })),
      },
    };
  }
}

