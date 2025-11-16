import { Droplet, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DustPoolManagement() {
  const dustPools = [
    {
      id: 1,
      group: "Roommates",
      manager: "Sarah Johnson",
      amount: "$47.32",
      members: 3,
      lastUpdated: "2 hours ago",
    },
    {
      id: 2,
      group: "Vegas Trip 2024",
      manager: "Alex Kim",
      amount: "$123.45",
      members: 5,
      lastUpdated: "1 day ago",
    },
    {
      id: 3,
      group: "Office Lunch Club",
      manager: "Jordan Martinez",
      amount: "$8.75",
      members: 8,
      lastUpdated: "3 days ago",
    },
  ]

  return (
    <div className="space-y-4">
      {dustPools.map((pool) => (
        <div key={pool.id} className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                <Droplet size={24} className="text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{pool.group}</h3>
                <p className="text-sm text-muted-foreground mb-2">Managed by {pool.manager}</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users size={16} />
                    {pool.members} members
                  </div>
                  <div className="text-sm text-muted-foreground">Updated {pool.lastUpdated}</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-accent mb-2">{pool.amount}</p>
              <Button className="bg-surface-light hover:bg-surface border border-border text-foreground text-sm">
                Manage
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button className="flex-1 bg-surface-light hover:bg-surface border border-border text-foreground">
              View Details
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground">Distribute</Button>
          </div>
        </div>
      ))}
    </div>
  )
}
