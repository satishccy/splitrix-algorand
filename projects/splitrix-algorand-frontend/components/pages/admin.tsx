"use client"

import { useState } from "react"
import { Shield, Users, Settings, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AdminPage() {
  const [adminStats] = useState({
    totalUsers: 1250,
    activeGroups: 342,
    totalTransactions: 8934,
    dustPoolTotal: 2345.67,
  })

  const [members] = useState([
    {
      id: 1,
      name: "Alex Johnson",
      role: "admin",
      joinDate: "2024-01-01",
      status: "active",
    },
    {
      id: 2,
      name: "Sarah Smith",
      role: "moderator",
      joinDate: "2024-01-05",
      status: "active",
    },
    {
      id: 3,
      name: "Mike Chen",
      role: "member",
      joinDate: "2024-01-10",
      status: "active",
    },
  ])

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-foreground-muted mt-1">Manage group settings and members</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass p-4 border border-border">
          <p className="text-sm text-foreground-muted mb-2">Total Users</p>
          <p className="text-3xl font-bold text-primary">{adminStats.totalUsers}</p>
        </Card>
        <Card className="glass p-4 border border-border">
          <p className="text-sm text-foreground-muted mb-2">Active Groups</p>
          <p className="text-3xl font-bold text-accent">{adminStats.activeGroups}</p>
        </Card>
        <Card className="glass p-4 border border-border">
          <p className="text-sm text-foreground-muted mb-2">Transactions</p>
          <p className="text-3xl font-bold text-primary">{adminStats.totalTransactions}</p>
        </Card>
        <Card className="glass p-4 border border-border">
          <p className="text-sm text-foreground-muted mb-2">Dust Pool</p>
          <p className="text-3xl font-bold text-warning">${adminStats.dustPoolTotal.toFixed(2)}</p>
        </Card>
      </div>

      {/* Controls */}
      <Card className="glass p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Group Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="outline" className="border-border hover:bg-surface-light justify-start bg-transparent">
            <Users size={18} />
            Manage Members
          </Button>
          <Button variant="outline" className="border-border hover:bg-surface-light justify-start bg-transparent">
            <Settings size={18} />
            Group Settings
          </Button>
          <Button variant="outline" className="border-border hover:bg-surface-light justify-start bg-transparent">
            <AlertCircle size={18} />
            Spending Limits
          </Button>
          <Button variant="outline" className="border-border hover:bg-surface-light justify-start bg-transparent">
            <Shield size={18} />
            Security
          </Button>
        </div>
      </Card>

      {/* Members */}
      <Card className="glass p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Members</h3>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-border/50"
            >
              <div>
                <p className="font-medium text-foreground">{member.name}</p>
                <p className="text-xs text-foreground-muted">
                  {member.role} • Joined {member.joinDate}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-border hover:bg-surface-light bg-transparent">
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border hover:bg-surface-light text-destructive bg-transparent"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
