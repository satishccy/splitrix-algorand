import { MoreVertical, Users, CheckCircle, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface BillCardProps {
  bill: {
    id: number
    title: string
    amount: number
    date: string
    participants: number
    status: "pending" | "settled"
    splitType: string
    yourShare: number
  }
}

export function BillCard({ bill }: BillCardProps) {
  return (
    <Card className="glass p-4 border border-border hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-foreground">{bill.title}</h3>
            {bill.status === "settled" ? (
              <CheckCircle size={18} className="text-accent" />
            ) : (
              <Clock size={18} className="text-warning" />
            )}
          </div>
          <p className="text-sm text-foreground-muted mb-3">{bill.date}</p>

          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-xs text-foreground-muted">Total Amount</p>
              <p className="text-lg font-bold text-primary">${bill.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Your Share</p>
              <p className="text-lg font-bold text-accent">${bill.yourShare.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Participants</p>
              <div className="flex items-center gap-1 mt-1">
                <Users size={16} className="text-foreground-muted" />
                <span className="text-lg font-bold text-foreground">{bill.participants}</span>
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
