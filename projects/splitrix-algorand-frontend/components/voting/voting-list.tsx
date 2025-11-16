"use client"

import { useState } from "react"
import { CheckCircle, Clock, AlertCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VotingModal } from "./voting-modal"

interface VotingListProps {
  filterStatus: "all" | "active" | "closed"
}

export function VotingList({ filterStatus }: VotingListProps) {
  const [selectedVote, setSelectedVote] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const votes = [
    {
      id: 1,
      title: "Approve Sarah as Fund Handler",
      description: "Vote to approve Sarah Johnson as the handler for Vegas Trip fund",
      group: "Vegas Trip 2024",
      status: "active",
      votesFor: 4,
      votesAgainst: 0,
      totalVoters: 5,
      yourVote: null,
      endsIn: "2 days",
    },
    {
      id: 2,
      title: "Increase Fund Target to $3000",
      description: "Proposal to increase the Vegas trip fund target from $2500 to $3000",
      group: "Vegas Trip 2024",
      status: "active",
      votesFor: 3,
      votesAgainst: 1,
      totalVoters: 5,
      yourVote: "for",
      endsIn: "1 day",
    },
    {
      id: 3,
      title: "Approve Alex as Fund Handler",
      description: "Vote to approve Alex Kim as the handler for Project Budget fund",
      group: "Project Budget",
      status: "closed",
      votesFor: 3,
      votesAgainst: 1,
      totalVoters: 4,
      yourVote: "for",
      endsIn: "Ended",
    },
    {
      id: 4,
      title: "Withdraw $500 from Fund",
      description: "Proposal to withdraw $500 from the group fund for trip expenses",
      group: "Vegas Trip 2024",
      status: "active",
      votesFor: 2,
      votesAgainst: 2,
      totalVoters: 5,
      yourVote: null,
      endsIn: "3 days",
    },
  ]

  const filteredVotes = votes.filter((vote) => filterStatus === "all" || vote.status === filterStatus)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock size={18} className="text-warning" />
      case "closed":
        return <CheckCircle size={18} className="text-success" />
      default:
        return <AlertCircle size={18} className="text-destructive" />
    }
  }

  const getVotePercentage = (votesFor: number, total: number) => {
    return Math.round((votesFor / total) * 100)
  }

  const handleViewVote = (vote: any) => {
    setSelectedVote(vote)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
      {filteredVotes.length === 0 ? (
        <div className="glass rounded-xl p-12 border border-border text-center">
          <p className="text-muted-foreground">No votes found</p>
        </div>
      ) : (
        filteredVotes.map((vote) => (
          <div
            key={vote.id}
            className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-foreground">{vote.title}</h3>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/30 text-primary">
                    {getStatusIcon(vote.status)}
                    {vote.status.charAt(0).toUpperCase() + vote.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{vote.description}</p>
                <p className="text-xs text-muted-foreground">{vote.group}</p>
              </div>
            </div>

            {/* Vote Progress */}
            <div className="space-y-3 mb-4 pb-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Vote Progress</span>
                <span className="text-sm text-muted-foreground">
                  {vote.votesFor + vote.votesAgainst} of {vote.totalVoters} voted
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-surface-light border border-border">
                <div
                  className="bg-success transition-all"
                  style={{ width: `${getVotePercentage(vote.votesFor, vote.totalVoters)}%` }}
                />
                <div
                  className="bg-destructive transition-all"
                  style={{ width: `${getVotePercentage(vote.votesAgainst, vote.totalVoters)}%` }}
                />
              </div>

              {/* Vote Counts */}
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">For</p>
                  <p className="text-lg font-bold text-success">{vote.votesFor}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Against</p>
                  <p className="text-lg font-bold text-destructive">{vote.votesAgainst}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ends In</p>
                  <p className="text-lg font-bold text-accent">{vote.endsIn}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleViewVote(vote)}
                className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground flex items-center gap-2"
              >
                <Eye size={18} />
                View Details
              </Button>
              {vote.status === "active" && !vote.yourVote && (
                <Button
                  className={`flex-1 ${
                    vote.yourVote === "for"
                      ? "bg-success hover:bg-success/90 text-foreground"
                      : "bg-surface-light hover:bg-surface border border-border text-foreground"
                  }`}
                >
                  Vote For
                </Button>
              )}
            </div>
          </div>
        ))
      )}
      </div>

      {/* Voting Modal */}
      <VotingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        voteData={selectedVote}
      />
    </>
  )
}
