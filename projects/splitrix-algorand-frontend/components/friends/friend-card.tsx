import { Send, MoreVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FriendCardProps {
  friend: {
    id: number
    name: string
    balance: number
    status: "owes_you" | "you_owe" | "settled"
    avatar: string
  }
}

export function FriendCard({ friend }: FriendCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "owes_you":
        return "text-accent"
      case "you_owe":
        return "text-destructive"
      default:
        return "text-foreground-muted"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "owes_you":
        return "Owes you"
      case "you_owe":
        return "You owe"
      default:
        return "Settled"
    }
  }

  return (
    <Card className="glass p-4 border border-border hover:border-primary/50 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary-dark flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold">{friend.avatar}</span>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">{friend.name}</h3>
            <p className={`text-sm ${getStatusColor(friend.status)}`}>{getStatusLabel(friend.status)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-foreground-muted mb-1">Balance</p>
            <p className={`text-lg font-bold ${friend.balance > 0 ? "text-destructive" : "text-accent"}`}>
              ${Math.abs(friend.balance).toFixed(2)}
            </p>
          </div>

          <Button variant="outline" size="sm" className="border-border hover:bg-surface-light bg-transparent">
            <Send size={18} />
          </Button>

          <Button variant="ghost" size="sm" className="text-foreground-muted hover:text-foreground">
            <MoreVertical size={18} />
          </Button>
        </div>
      </div>
    </Card>
  )
}
