import prisma from '../prisma/client';

export class GroupService {
  /**
   * Get all groups, optionally filtered by member address
   */
  async getGroups(memberAddress?: string) {
    if (memberAddress) {
      return prisma.group.findMany({
        where: {
          members: {
            some: {
              address: memberAddress,
            },
          },
        },
        include: {
          members: true,
          _count: {
            select: {
              bills: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return prisma.group.findMany({
      include: {
        members: true,
        _count: {
          select: {
            bills: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get group by ID with members
   */
  async getGroupById(groupId: string) {
    return prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
        _count: {
          select: {
            bills: true,
          },
        },
      },
    });
  }

  /**
   * Get bills for a group
   */
  async getGroupBills(groupId: string) {
    return prisma.bill.findMany({
      where: { groupId },
      include: {
        debtors: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

