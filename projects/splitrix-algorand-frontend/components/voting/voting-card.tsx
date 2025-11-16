"use client"

import { Clock, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface VotingCardProps {
  vote: {
    id: number
    title: string
    group: string
    options: Array<{ id: number; name: string; votes: number }>
    status: "active" | "closed"
    endDate: string
    totalVoters: number
    hasVoted: boolean
  }
}

export function VotingCard({ vote }: VotingCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  const maxVotes = Math.max(...vote.options.map((o) => o.votes))

  return (
    <Card className="glass p-6 border border-border">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-foreground">{vote.title}</h3>
            <p className="text-sm text-foreground-muted">{vote.group}</p>
          </div>
          {vote.status === "active" ? (
            <div className="flex items-center gap-1 text-warning">
              <Clock size={18} />
              <span className="text-sm font-medium">Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-accent">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Closed</span>
            </div>
          )}
        </div>
        <p className="text-xs text-foreground-muted">Ends: {vote.endDate}</p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-4">
        {vote.options.map((option) => {
          const percentage = (option.votes / vote.totalVoters) * 100
          return (
            <div key={option.id}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{option.name}</span>
                <span className="text-sm text-foreground-muted">
                  {option.votes} votes ({percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Vote Button */}
      {vote.status === "active" && !vote.hasVoted && (
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary-dark">Cast Your Vote</Button>
      )}

      {vote.hasVoted && (
        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20 text-center">
          <p className="text-sm text-accent font-medium">You have voted</p>
        </div>
      )}
    </Card>
  )
}
