"use client"

import { useFriends } from "@/contexts/FriendsContext"
import { UserCheck } from "lucide-react"

interface AddressBadgeProps {
  address: string
  nickname?: string
  showAddress?: boolean
  className?: string
}

/**
 * Compact badge component for displaying addresses with friend indicators
 * Use this for inline address displays in lists, cards, etc.
 */
export function AddressBadge({
  address,
  nickname,
  showAddress = true,
  className = "",
}: AddressBadgeProps) {
  const { isFriend, getFriendInfo } = useFriends()
  const isFriendAddress = isFriend(address)
  const friendInfo = getFriendInfo(address)

  const displayName = nickname || friendInfo?.nickname || `${address.slice(0, 8)}...`
  const displayAddress = showAddress ? address : null

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-sm font-semibold text-foreground">{displayName}</span>
      {isFriendAddress && (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary border border-primary/30"
          title={`Known friend: ${friendInfo?.nickname || address}`}
        >
          <UserCheck size={10} />
        </span>
      )}
      {displayAddress && (
        <span className="text-xs text-muted-foreground font-mono">{displayAddress}</span>
      )}
    </div>
  )
}

