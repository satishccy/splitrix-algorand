import { Users, MoreVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface GroupCardProps {
  group: {
    id: number
    name: string
    members: number
    totalSpent: number
    yourShare: number
    status: "active" | "settled"
    avatar: string
  }
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Card className="glass p-4 border border-border hover:border-primary/50 transition-all cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold">{group.avatar}</span>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">{group.name}</h3>
            <p className="text-sm text-foreground-muted mb-3">{group.status === "active" ? "Active" : "Settled"}</p>

            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs text-foreground-muted">Members</p>
                <div className="flex items-center gap-1 mt-1">
                  <Users size={16} className="text-foreground-muted" />
                  <span className="font-medium text-foreground">{group.members}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-foreground-muted">Total Spent</p>
                <p className="font-bold text-primary mt-1">${group.totalSpent.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-foreground-muted">Your Share</p>
                <p className="font-bold text-accent mt-1">${group.yourShare.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="text-foreground-muted hover:text-foreground">
          <MoreVertical size={18} />
        </Button>
      </div>
    </Card>
  )
}
