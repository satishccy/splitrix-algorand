"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GroupCard } from "@/components/groups/group-card"

export function GroupsPage() {
  const [groups] = useState([
    {
      id: 1,
      name: "Trip to Vegas",
      members: 5,
      totalSpent: 2450.0,
      yourShare: 490.0,
      status: "active",
      avatar: "V",
    },
    {
      id: 2,
      name: "Apartment Rent",
      members: 3,
      totalSpent: 4500.0,
      yourShare: 1500.0,
      status: "active",
      avatar: "A",
    },
    {
      id: 3,
      name: "Weekend Getaway",
      members: 4,
      totalSpent: 1200.0,
      yourShare: 300.0,
      status: "settled",
      avatar: "W",
    },
  ])

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Groups</h1>
          <p className="text-foreground-muted mt-1">Manage group funds and shared expenses</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary-dark w-full md:w-auto">
          <Plus size={20} />
          Create Group
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass p-4 border border-border">
          <p className="text-sm text-foreground-muted mb-2">Active Groups</p>
          <p className="text-3xl font-bold text-primary">{groups.length}</p>
        </Card>
        <Card className="glass p-4 border border-border">
          <p className="text-sm text-foreground-muted mb-2">Total Spent</p>
          <p className="text-3xl font-bold text-accent">
            ${groups.reduce((sum, g) => sum + g.totalSpent, 0).toFixed(2)}
          </p>
        </Card>
        <Card className="glass p-4 border border-border">
          <p className="text-sm text-foreground-muted mb-2">Your Total Share</p>
          <p className="text-3xl font-bold text-primary">
            ${groups.reduce((sum, g) => sum + g.yourShare, 0).toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Groups List */}
      <div className="space-y-3">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  )
}
