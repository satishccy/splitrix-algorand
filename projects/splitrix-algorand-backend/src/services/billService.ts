import prisma from '../prisma/client';

export class BillService {
  /**
   * Get bill by ID (format: "groupId:billId")
   */
  async getBillById(billId: string) {
    return prisma.bill.findUnique({
      where: { id: billId },
      include: {
        debtors: true,
        group: {
          include: {
            members: true,
          },
        },
      },
    });
  }

  /**
   * Get all bills for a user (as payer or debtor)
   */
  async getUserBills(address: string) {
    const [asPayer, asDebtor] = await Promise.all([
      prisma.bill.findMany({
        where: { payer: address },
        include: {
          debtors: true,
          group: {
            include: {
              members: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.bill.findMany({
        where: {
          debtors: {
            some: {
              address: address,
            },
          },
        },
        include: {
          debtors: true,
          group: {
            include: {
              members: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      asPayer,
      asDebtor,
    };
  }
}

