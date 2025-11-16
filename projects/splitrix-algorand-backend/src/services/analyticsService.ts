import prisma from '../prisma/client';

export interface UserAnalytics {
  address: string;
  totalSpent: bigint; // Total amount paid as payer
  totalOwed: bigint; // Total amount owed to user
  totalOwes: bigint; // Total amount user owes
  netBalance: bigint;
  billCount: {
    asPayer: number;
    asDebtor: number;
  };
  groupCount: number;
  spendingByGroup: Array<{
    groupId: string;
    amount: bigint;
    billCount: number;
  }>;
}

export interface GroupAnalytics {
  groupId: string;
  totalSpent: bigint;
  billCount: number;
  memberCount: number;
  spendingByMember: Array<{
    address: string;
    totalPaid: bigint; // As payer
    totalOwed: bigint; // Amount owed to them
    totalOwes: bigint; // Amount they owe
    netBalance: bigint;
    billCount: number;
  }>;
}

export class AnalyticsService {
  /**
   * Get user analytics
   */
  async getUserAnalytics(address: string): Promise<UserAnalytics> {
    // Get bills where user is payer
    const payerBills = await prisma.bill.findMany({
      where: { payer: address },
      include: {
        debtors: true,
        group: true,
      },
    });

    // Get bills where user is debtor
    const debtorBills = await prisma.debtor.findMany({
      where: { address },
      include: {
        bill: {
          include: {
            group: true,
          },
        },
      },
    });

    // Calculate total spent (as payer)
    const totalSpent = payerBills.reduce(
      (sum, bill) => sum + bill.totalAmount,
      BigInt(0)
    );

    // Calculate total owed to user (from debtors in payer bills)
    const totalOwed = payerBills.reduce((sum, bill) => {
      return (
        sum +
        bill.debtors.reduce((debtSum, debtor) => {
          return debtSum + (debtor.amount - debtor.paid);
        }, BigInt(0))
      );
    }, BigInt(0));

    // Calculate total user owes (as debtor)
    const totalOwes = debtorBills.reduce(
      (sum, debtor) => sum + (debtor.amount - debtor.paid),
      BigInt(0)
    );

    // Calculate spending by group
    const groupSpendingMap = new Map<string, { amount: bigint; billCount: number }>();
    for (const bill of payerBills) {
      const groupId = bill.groupId;
      if (!groupSpendingMap.has(groupId)) {
        groupSpendingMap.set(groupId, { amount: BigInt(0), billCount: 0 });
      }
      const entry = groupSpendingMap.get(groupId)!;
      entry.amount += bill.totalAmount;
      entry.billCount += 1;
    }

    // Get unique groups user is part of
    const groupIds = new Set<string>();
    payerBills.forEach((bill) => groupIds.add(bill.groupId));
    debtorBills.forEach((debtor) => groupIds.add(debtor.bill.groupId));

    return {
      address,
      totalSpent,
      totalOwed,
      totalOwes,
      netBalance: totalOwed - totalOwes,
      billCount: {
        asPayer: payerBills.length,
        asDebtor: debtorBills.length,
      },
      groupCount: groupIds.size,
      spendingByGroup: Array.from(groupSpendingMap.entries()).map(([groupId, data]) => ({
        groupId,
        amount: data.amount,
        billCount: data.billCount,
      })),
    };
  }

  /**
   * Get group analytics
   */
  async getGroupAnalytics(groupId: string): Promise<GroupAnalytics | null> {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
        bills: {
          include: {
            debtors: true,
          },
        },
      },
    });

    if (!group) {
      return null;
    }

    // Calculate total spent in group
    const totalSpent = group.bills.reduce(
      (sum, bill) => sum + bill.totalAmount,
      BigInt(0)
    );

    // Calculate spending by member
    const memberSpendingMap = new Map<
      string,
      {
        totalPaid: bigint;
        totalOwed: bigint;
        totalOwes: bigint;
        billCount: number;
      }
   >();

    // Initialize all members
    for (const member of group.members) {
      memberSpendingMap.set(member.address, {
        totalPaid: BigInt(0),
        totalOwed: BigInt(0),
        totalOwes: BigInt(0),
        billCount: 0,
      });
    }

    // Process bills
    for (const bill of group.bills) {
      const payer = bill.payer;
      const payerEntry = memberSpendingMap.get(payer);
      if (payerEntry) {
        payerEntry.totalPaid += bill.totalAmount;
        payerEntry.billCount += 1;
      }

      for (const debtor of bill.debtors) {
        const debtorEntry = memberSpendingMap.get(debtor.address);
        if (debtorEntry) {
          const pending = debtor.amount - debtor.paid;
          debtorEntry.totalOwes += pending;

          // Update payer's owed amount
          if (payerEntry) {
            payerEntry.totalOwed += pending;
          }
        }
      }
    }

    const spendingByMember = Array.from(memberSpendingMap.entries()).map(
      ([address, data]) => ({
        address,
        totalPaid: data.totalPaid,
        totalOwed: data.totalOwed,
        totalOwes: data.totalOwes,
        netBalance: data.totalOwed - data.totalOwes,
        billCount: data.billCount,
      })
    );

    return {
      groupId,
      totalSpent,
      billCount: group.bills.length,
      memberCount: group.members.length,
      spendingByMember,
    };
  }
}

