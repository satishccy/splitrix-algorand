"use client"

import { Plus, Split, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CreateBillModal } from "@/components/bills/create-bill-modal"
import { CreateGroupModal } from "@/components/groups/create-group-modal"

export function QuickActions() {
  const [isCreateBillOpen, setIsCreateBillOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)

  const handleAction = (action: string) => {
    switch (action) {
      case "Create Bill":
        setIsCreateBillOpen(true)
        break
      case "Create Group":
        setIsCreateGroupOpen(true)
        break
      case "Split Expense":
        // Navigate to bills page or open split modal
        console.log("Split Expense clicked")
        break
      case "View Analytics":
        // Navigate to analytics page
        console.log("View Analytics clicked")
        break
    }
  }

  const actions = [
    { icon: Plus, label: "Create Bill", action: "Create Bill" },
    { icon: Split, label: "Split Expense", action: "Split Expense" },
    { icon: Users, label: "Create Group", action: "Create Group" },
    { icon: TrendingUp, label: "View Analytics", action: "View Analytics" },
  ]

  return (
    <>
      <div className="glass rounded-xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                onClick={() => handleAction(action.action)}
                className="flex flex-col items-center gap-2 h-auto py-4 bg-primary hover:bg-primary-dark text-primary-foreground"
              >
                <Icon size={24} />
                <span className="text-xs font-medium text-center">{action.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Modals */}
      <CreateBillModal isOpen={isCreateBillOpen} onClose={() => setIsCreateBillOpen(false)} />
      <CreateGroupModal isOpen={isCreateGroupOpen} onClose={() => setIsCreateGroupOpen(false)} />
    </>
  )
}
