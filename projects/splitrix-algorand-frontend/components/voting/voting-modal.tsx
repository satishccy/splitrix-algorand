"use client"

import { useState } from "react"
import { X, Check, XCircle, Users, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VotingModalProps {
  isOpen: boolean
  onClose: () => void
  voteData?: {
    id: number
    title: string
    description: string
    group: string
    status: string
    votesFor: number
    votesAgainst: number
    totalVoters: number
    yourVote: string | null
    endsIn: string
  }
}

export function VotingModal({ isOpen, onClose, voteData }: VotingModalProps) {
  const [selectedVote, setSelectedVote] = useState<"for" | "against" | null>(null)
  const [isVoting, setIsVoting] = useState(false)

  if (!isOpen || !voteData) return null

  const handleVote = async (vote: "for" | "against") => {
    setIsVoting(true)
    setSelectedVote(vote)
    
    // Simulate voting process
    setTimeout(() => {
      console.log(`Voted ${vote} for:`, voteData.title)
      setIsVoting(false)
      onClose()
    }, 1500)
  }

  const getVotePercentage = (votesFor: number, total: number) => {
    return Math.round((votesFor / total) * 100)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock size={18} className="text-warning" />
      case "closed":
        return <Check size={18} className="text-success" />
      default:
        return <AlertCircle size={18} className="text-destructive" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
              {getStatusIcon(voteData.status)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Vote Details</h2>
              <p className="text-sm text-muted-foreground">{voteData.group}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-light rounded-lg transition-colors">
            <X size={24} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vote Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">{voteData.title}</h3>
              <p className="text-muted-foreground">{voteData.description}</p>
            </div>

            {/* Vote Progress */}
            <div className="p-4 rounded-lg bg-surface-light border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">Current Results</span>
                <span className="text-sm text-muted-foreground">
                  {voteData.votesFor + voteData.votesAgainst} of {voteData.totalVoters} voted
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-surface border border-border mb-3">
                <div
                  className="bg-success transition-all"
                  style={{ width: `${getVotePercentage(voteData.votesFor, voteData.totalVoters)}%` }}
                />
                <div
                  className="bg-destructive transition-all"
                  style={{ width: `${getVotePercentage(voteData.votesAgainst, voteData.totalVoters)}%` }}
                />
              </div>

              {/* Vote Counts */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">For</p>
                  <p className="text-2xl font-bold text-success">{voteData.votesFor}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Against</p>
                  <p className="text-2xl font-bold text-destructive">{voteData.votesAgainst}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Ends In</p>
                  <p className="text-2xl font-bold text-accent">{voteData.endsIn}</p>
                </div>
              </div>
            </div>

            {/* Candidate Addresses (for Fund Handler votes) */}
            {voteData.title.includes("Fund Handler") && (
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/30">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users size={16} />
                  Candidate Addresses
                </h4>
                <div className="space-y-2">
                  <div className="p-3 rounded bg-surface-light border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Sarah Johnson</p>
                    <p className="text-sm font-mono text-foreground break-all">
                      ALGORAND_ADDRESS_SARAH_1234567890ABCDEF
                    </p>
                  </div>
                  <div className="p-3 rounded bg-surface-light border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Alex Kim</p>
                    <p className="text-sm font-mono text-foreground break-all">
                      ALGORAND_ADDRESS_ALEX_1234567890ABCDEF
                    </p>
                  </div>
                  <div className="p-3 rounded bg-surface-light border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Jordan Martinez</p>
                    <p className="text-sm font-mono text-foreground break-all">
                      ALGORAND_ADDRESS_JORDAN_1234567890ABCDEF
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Your Current Vote */}
            {voteData.yourVote && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Check size={16} className="text-primary" />
                  <span className="text-sm font-semibold text-foreground">Your Vote</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You voted <span className="font-semibold text-primary capitalize">{voteData.yourVote}</span> this proposal
                </p>
              </div>
            )}
          </div>

          {/* Voting Actions */}
          {voteData.status === "active" && !voteData.yourVote && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">Cast Your Vote</h4>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleVote("for")}
                  disabled={isVoting}
                  className="h-16 bg-success hover:bg-success/90 text-foreground flex flex-col gap-2 disabled:opacity-50"
                >
                  <Check size={24} />
                  <span className="font-semibold">Vote For</span>
                </Button>
                <Button
                  onClick={() => handleVote("against")}
                  disabled={isVoting}
                  className="h-16 bg-destructive hover:bg-destructive/90 text-foreground flex flex-col gap-2 disabled:opacity-50"
                >
                  <XCircle size={24} />
                  <span className="font-semibold">Vote Against</span>
                </Button>
              </div>
              
              {isVoting && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/30">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                    <p className="text-sm text-foreground">Processing your vote...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              onClick={onClose}
              className="flex-1 bg-surface-light hover:bg-surface border border-border text-foreground"
            >
              {voteData.status === "active" && !voteData.yourVote ? "Cancel" : "Close"}
            </Button>
            {voteData.status === "active" && !voteData.yourVote && (
              <Button
                onClick={() => console.log("View full details")}
                className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground"
              >
                View Full Details
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

