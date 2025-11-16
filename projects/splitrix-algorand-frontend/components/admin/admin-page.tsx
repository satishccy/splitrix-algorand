"use client"

import { useState } from "react"
import { Users, DollarSign, AlertCircle, Settings } from "lucide-react"
import { AdminStats } from "./admin-stats"
import { UserManagement } from "./user-management"
import { SpendingLimits } from "./spending-limits"
import { DustPoolManagement } from "./dust-pool-management"

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "limits" | "dust">("overview")

  const tabs = [
    { id: "overview", label: "Overview", icon: AlertCircle },
    { id: "users", label: "Users", icon: Users },
    { id: "limits", label: "Spending Limits", icon: DollarSign },
    { id: "dust", label: "Dust Pool", icon: Settings },
  ]

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Controls</h1>
        <p className="text-muted-foreground">Manage groups, users, and system settings</p>
      </div>

      {/* Tabs */}
      <div className="glass rounded-xl p-4 border border-border flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-light border border-border text-foreground hover:border-primary/50"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div>
        {activeTab === "overview" && <AdminStats />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "limits" && <SpendingLimits />}
        {activeTab === "dust" && <DustPoolManagement />}
      </div>
    </div>
  )
}
