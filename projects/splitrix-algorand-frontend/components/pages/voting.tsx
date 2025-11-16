"use client"

import { useState } from "react"
import { VotingCard } from "@/components/voting/voting-card"

export function VotingPage() {
  const [votes] = useState([
    {
      id: 1,
      title: "Who should handle the Vegas trip fund?",
      group: "Trip to Vegas",
      options: [
        { id: 1, name: "Alex Johnson", votes: 3 },
        { id: 2, name: "Sarah Smith", votes: 2 },
      ],
      status: "active",
      endDate: "2024-01-20",
      totalVoters: 5,
      hasVoted: false,
    },
    {
      id: 2,
      title: "Approve new member for apartment group?",
      group: "Apartment Rent",
      options: [
        { id: 1, name: "Yes", votes: 2 },
        { id: 2, name: "No", votes: 1 },
      ],
      status: "active",
      endDate: "2024-01-18",
      totalVoters: 3,
      hasVoted: true,
    },
    {
      id: 3,
      title: "Dust pool distribution method",
      group: "Dinner Night",
      options: [
        { id: 1, name: "Equal split", votes: 4 },
        { id: 2, name: "Proportional", votes: 1 },
      ],
      status: "closed",
      endDate: "2024-01-15",
      totalVoters: 5,
      hasVoted: true,
    },
  ])

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Voting</h1>
        <p className="text-foreground-muted mt-1">Participate in group decisions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button className="px-4 py-2 border-b-2 border-primary text-primary font-medium">Active Votes</button>
        <button className="px-4 py-2 text-foreground-muted hover:text-foreground transition-colors">
          Closed Votes
        </button>
      </div>

      {/* Voting List */}
      <div className="space-y-4">
        {votes
          .filter((v) => v.status === "active")
          .map((vote) => (
            <VotingCard key={vote.id} vote={vote} />
          ))}
      </div>
    </div>
  )
}
