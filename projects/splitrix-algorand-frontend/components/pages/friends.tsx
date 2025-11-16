"use client"

import { useState } from "react"
import { Plus, Search, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FriendCard } from "@/components/friends/friend-card"

export function FriendsPage() {
  const [friends] = useState([
    {
      id: 1,
      name: "Alex Johnson",
      balance: -45.5,
      status: "owes_you",
      avatar: "A",
    },
    {
      id: 2,
      name: "Sarah Smith",
      balance: 32.0,
      status: "you_owe",
      avatar: "S",
    },
    {
      id: 3,
      name: "Mike Chen",
      balance: 0,
      status: "settled",
      avatar: "M",
    },
    {
      id: 4,
      name: "Emma Davis",
      balance: -120.0,
      status: "owes_you",
      avatar: "E",
    },
  ])

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Friends</h1>
          <p className="text-foreground-muted mt-1">Manage your connections and balances</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none border-border hover:bg-surface-light bg-transparent">
            <QrCode size={20} />
            QR Code
          </Button>
          <Button className="flex-1 md:flex-none bg-primary text-primary-foreground hover:bg-primary-dark">
            <Plus size={20} />
            Add Friend
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
        <input
          type="text"
          placeholder="Search friends..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-border text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
        />
      </div>

      {/* Friends List */}
      <div className="space-y-3">
        {friends.map((friend) => (
          <FriendCard key={friend.id} friend={friend} />
        ))}
      </div>
    </div>
  )
}
