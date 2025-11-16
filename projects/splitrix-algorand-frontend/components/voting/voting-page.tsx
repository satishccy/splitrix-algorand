"use client"

import { useState } from "react"
import { VotingList } from "./voting-list"

export function VotingPage() {
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "closed">("all")

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Voting</h1>
        <p className="text-muted-foreground">Vote on group fund handlers and decisions</p>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 border border-border flex gap-2">
        {(["all", "active", "closed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === status
                ? "bg-primary text-primary-foreground"
                : "bg-surface-light border border-border text-foreground hover:border-primary/50"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Voting List */}
      <VotingList filterStatus={filterStatus} />
    </div>
  )
}
