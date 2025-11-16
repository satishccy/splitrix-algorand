import prisma from '../prisma/client';

export interface DebtorMinimal {
  debtor: string; // Algorand address
  amount: string; // BigInt as string
}

export interface PayerDebt {
  bill_id: string; // bill_id as string
  bill_payer: string; // Algorand address of the old bill's payer
  payer_index_in_bill_debtors: string; // Index in old bill's debtors array
  amount_to_cutoff: string; // Amount to net (BigInt as string)
  debtor_index_in_current_bill: string; // Index in new bill's debtors array
}

export interface CreateBillHelperData {
  group_id: string;
  payer: string;
  total_amount: string;
  debtors: DebtorMinimal[];
  memo: string;
  payers_debt: PayerDebt[];
}

export class HelperService {
  /**
   * Get helper data for creating a bill
   * 
   * This calculates netting opportunities and prepares the data structure ready to be passed
   * to the `create_bill` contract method.
   * 
   * Netting Logic:
   * - If the payer (creating new bill) owes money to someone (from an old bill)
   * - And that someone is a debtor in the new bill
   * - Then we can net the debt (offset it)
   * 
   * Example:
   * - Alice owes Bob $50 from Bill #1
   * - Alice creates Bill #2 where Bob owes $30
   * - Netting: Alice's $50 debt to Bob is reduced by $30, Bob's $30 debt to Alice is considered paid
   * 
   * @param groupId - Group ID
   * @param payer - Address of the payer (who paid for the bill)
   * @param debtors - Array of debtors with their amounts
   * @param memo - Memo/description for the bill
   * @returns Formatted data ready for create_bill contract call
   */
  async getCreateBillHelperData(
    groupId: string,
    payer: string,
    debtors: Array<{ address: string; amount: bigint }>,
    memo: string
  ): Promise<CreateBillHelperData> {
    // Validate group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
        bills: {
          include: {
            debtors: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Validate payer is a member
    const payerIsMember = group.members.some((m) => m.address === payer);
    if (!payerIsMember) {
      throw new Error('Payer is not a member of the group');
    }

    // Validate all debtors are members
    for (const debtor of debtors) {
      const isMember = group.members.some((m) => m.address === debtor.address);
      if (!isMember) {
        throw new Error(`Debtor ${debtor.address} is not a member of the group`);
      }
    }

    // Calculate total amount
    const totalAmount = debtors.reduce((sum, d) => sum + d.amount, BigInt(0));

    // Format debtors for the contract
    const formattedDebtors: DebtorMinimal[] = debtors.map((d) => ({
      debtor: d.address,
      amount: d.amount.toString(),
    }));

    // Find netting opportunities
    // Netting: If the payer owes someone, and that someone is a debtor in the new bill,
    // we can net the debt
    const payersDebt: PayerDebt[] = [];

    // Get all bills where the payer is a debtor (payer owes money)
    const billsWherePayerOwes = await prisma.bill.findMany({
      where: {
        groupId,
        debtors: {
          some: {
            address: payer,
          },
        },
      },
      include: {
        debtors: true,
      },
    });

    // For each bill where payer owes money, check if the bill's payer is in the new bill's debtors
    for (const oldBill of billsWherePayerOwes) {
      const payerDebtor = oldBill.debtors.find((d) => d.address === payer);
      if (!payerDebtor) continue;

      const pendingDebt = payerDebtor.amount - payerDebtor.paid;
      if (pendingDebt <= 0) continue; // Already paid

      // Check if the old bill's payer is a debtor in the new bill
      const debtorIndex = debtors.findIndex((d) => d.address === oldBill.payer);
      if (debtorIndex === -1) continue; // Not a debtor in new bill, can't net

      // Find the index of payer in old bill's debtors array
      const payerIndexInOldBill = oldBill.debtors.findIndex((d) => d.address === payer);
      if (payerIndexInOldBill === -1) continue;

      // Calculate netting amount (min of pending debt and new bill amount)
      const newBillDebtorAmount = debtors[debtorIndex].amount;
      const nettingAmount = pendingDebt < newBillDebtorAmount ? pendingDebt : newBillDebtorAmount;

      if (nettingAmount > 0) {
        payersDebt.push({
          bill_id: oldBill.billId,
          bill_payer: oldBill.payer,
          payer_index_in_bill_debtors: payerIndexInOldBill.toString(),
          amount_to_cutoff: nettingAmount.toString(),
          debtor_index_in_current_bill: debtorIndex.toString(),
        });
      }
    }

    return {
      group_id: groupId,
      payer,
      total_amount: totalAmount.toString(),
      debtors: formattedDebtors,
      memo,
      payers_debt: payersDebt,
    };
  }

  /**
   * Get pending debts for a payer in a group (bills where payer owes money)
   * Useful for frontend to show what can be netted
   */
  async getPendingDebtsForPayer(groupId: string, payer: string) {
    const bills = await prisma.bill.findMany({
      where: {
        groupId,
        debtors: {
          some: {
            address: payer,
          },
        },
      },
      include: {
        debtors: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bills
      .map((bill) => {
        const debtor = bill.debtors.find((d) => d.address === payer);
        if (!debtor) return null;

        const pending = debtor.amount - debtor.paid;
        if (pending <= 0) return null;

        return {
          billId: bill.id,
          billIdNum: bill.billId,
          payer: bill.payer,
          totalAmount: bill.totalAmount.toString(),
          pendingAmount: pending.toString(),
          memo: bill.memo,
          createdAt: bill.createdAt,
        };
      })
      .filter((b) => b !== null);
  }

  /**
   * Get group members for a group
   */
  async getGroupMembers(groupId: string) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    return group.members.map((m) => ({
      address: m.address,
    }));
  }
}

