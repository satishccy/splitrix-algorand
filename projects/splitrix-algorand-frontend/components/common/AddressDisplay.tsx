"use client"

import { useFriends } from "@/contexts/FriendsContext"
import { UserCheck } from "lucide-react"

interface AddressDisplayProps {
  address: string
  nickname?: string
  showFull?: boolean
  className?: string
  showFriendBadge?: boolean
  maxLength?: number
  showAddressBelow?: boolean
}

export function AddressDisplay({
  address,
  nickname,
  showFull = false,
  className = "",
  showFriendBadge = true,
  maxLength = 8,
  showAddressBelow = false,
}: AddressDisplayProps) {
  const { isFriend, getFriendInfo } = useFriends()
  const isFriendAddress = isFriend(address)
  const friendInfo = getFriendInfo(address)

  // Use provided nickname, friend's nickname, or formatted address
  const displayNickname = nickname || friendInfo?.nickname
  
  const displayAddress = showFull
    ? address
    : `${address.slice(0, maxLength)}...${address.slice(-4)}`

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">
          {displayNickname || displayAddress}
        </span>
        {isFriendAddress && showFriendBadge && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30"
            title={`Known friend: ${friendInfo?.nickname || address}`}
          >
            <UserCheck size={12} />
            Friend
          </span>
        )}
      </div>
      {(showAddressBelow || displayNickname) && (
        <span className="text-xs text-muted-foreground font-mono truncate">
          {address}
        </span>
      )}
    </div>
  )
}

