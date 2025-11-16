import prisma from "../prisma/client";

export interface FriendData {
  address: string;
  friendAddress: string;
  nickname: string;
}

export class FriendService {
  /**
   * Add a friend for a user
   */
  async addFriend(data: FriendData): Promise<void> {
    // Check if friendship already exists
    const existing = await prisma.friend.findFirst({
      where: {
        address: data.address,
        friendAddress: data.friendAddress,
      },
    });

    if (existing) {
      await prisma.friend.update({
        where: {
          id: existing.id,
        },
        data: {
          nickname: data.nickname,
        },
      });
    } else {
      await prisma.friend.createMany({
        data: [
          {
            address: data.address,
            friendAddress: data.friendAddress,
            nickname: data.nickname,
          },
        ],
        skipDuplicates: true,
      });
    }
  }

  /**
   * Get all friends for an address
   */
  async getFriends(address: string): Promise<Array<{ friendAddress: string; nickname: string | null }>> {
    const friends = await prisma.friend.findMany({
      where: {
        address,
      },
      select: {
        friendAddress: true,
        nickname: true,
      },
    });

    return friends;
  }

  /**
   * Remove a friend
   */
  async removeFriend(address: string, friendAddress: string): Promise<void> {
    await prisma.friend.deleteMany({
      where: {
        address,
        friendAddress,
      },
    });
  }
}
