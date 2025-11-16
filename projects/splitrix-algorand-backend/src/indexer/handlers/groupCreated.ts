import prisma from '../../prisma/client';
import { ChainClient } from '../chainClient';
import { GroupCreatedEvent } from '../eventParser';
import { logger } from '../logger';

export async function handleGroupCreated(
  event: GroupCreatedEvent,
  chainClient: ChainClient,
  blockRound: number
): Promise<void> {
  const groupId = event.groupId.toString();

  try {
    // Fetch group data from chain
    const groupData = await chainClient.getGroupData(event.groupId);

    if (!groupData) {
      logger.warn(`Group data not found on chain for groupId ${groupId} at block ${blockRound}`);
      return;
    }

    // Upsert group
    await prisma.group.upsert({
      where: { id: groupId },
      update: {
        admin: groupData.admin,
        memberCount: groupData.members.length,
      },
      create: {
        id: groupId,
        admin: groupData.admin,
        memberCount: groupData.members.length,
      },
    });

    // Upsert group members
    for (const memberAddress of groupData.members) {
      await prisma.groupMember.upsert({
        where: {
          groupId_address: {
            groupId,
            address: memberAddress,
          },
        },
        update: {},
        create: {
          groupId,
          address: memberAddress,
        },
      });
    }

    // Remove members that are no longer in the group
    await prisma.groupMember.deleteMany({
      where: {
        groupId,
        address: {
          notIn: groupData.members,
        },
      },
    });

    logger.info(`Processed GroupCreated event for groupId ${groupId} at block ${blockRound}`);
  } catch (error) {
    logger.error(`Error handling GroupCreated event for groupId ${groupId}:`, error);
    throw error;
  }
}

