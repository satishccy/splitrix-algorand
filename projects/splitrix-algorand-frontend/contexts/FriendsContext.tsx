"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { friendsApi } from "@/lib/api";

interface Friend {
  friendAddress: string;
  nickname: string;
}

interface FriendsContextType {
  friends: Friend[];
  loading: boolean;
  error: string | null;
  loadFriends: () => Promise<void>;
  addFriend: (friendAddress: string, nickname?: string) => Promise<void>;
  removeFriend: (friendAddress: string) => Promise<void>;
  refreshFriends: () => Promise<void>;
  isFriend: (address: string) => boolean;
  getFriendInfo: (address: string) => Friend | null;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export function FriendsProvider({ children }: { children: ReactNode }) {
  const { activeAddress } = useWallet();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    if (!activeAddress) {
      setFriends([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userFriends = await friendsApi.getFriends(activeAddress);
      console.log("userFriends", userFriends);
      setFriends(userFriends || []);
    } catch (err: any) {
      console.error("Failed to load friends:", err);
      setError(err.message || "Failed to load friends");
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, [activeAddress]);

  const addFriend = useCallback(
    async (friendAddress: string, nickname?: string) => {
      if (!activeAddress) {
        throw new Error("Wallet not connected");
      }

      try {
        setError(null);
        await friendsApi.addFriend({
          address: activeAddress,
          friendAddress,
          nickname,
        });
        // Reload friends after adding
        await loadFriends();
      } catch (err: any) {
        console.error("Failed to add friend:", err);
        setError(err.message || "Failed to add friend");
        throw err;
      }
    },
    [activeAddress, loadFriends]
  );

  const removeFriend = useCallback(
    async (friendAddress: string) => {
      if (!activeAddress) {
        throw new Error("Wallet not connected");
      }

      try {
        setError(null);
        await friendsApi.removeFriend(activeAddress, friendAddress);
        // Reload friends after removing
        await loadFriends();
      } catch (err: any) {
        console.error("Failed to remove friend:", err);
        setError(err.message || "Failed to remove friend");
        throw err;
      }
    },
    [activeAddress, loadFriends]
  );

  const refreshFriends = useCallback(async () => {
    await loadFriends();
  }, [loadFriends]);

  const isFriend = useCallback(
    (address: string): boolean => {
      if (!address) return false;
      return friends.some((friend) => friend.friendAddress.toLowerCase() === address.toLowerCase());
    },
    [friends]
  );

  const getFriendInfo = useCallback(
    (address: string): Friend | null => {
      if (!address) return null;
      return friends.find((friend) => friend.friendAddress.toLowerCase() === address.toLowerCase()) || null;
    },
    [friends]
  );

  // Load friends when wallet address changes
  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  return (
    <FriendsContext.Provider
      value={{
        friends,
        loading,
        error,
        loadFriends,
        addFriend,
        removeFriend,
        refreshFriends,
        isFriend,
        getFriendInfo,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error("useFriends must be used within a FriendsProvider");
  }
  return context;
}
