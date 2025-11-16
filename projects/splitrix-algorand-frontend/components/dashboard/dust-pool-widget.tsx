import { Droplet, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function DustPoolWidget() {
  return (
    <div className="glass rounded-xl p-6 border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-accent/10 border border-accent/30">
          <Droplet size={20} className="text-accent" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Dust Pool</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Total Dust</p>
          <p className="text-2xl font-bold text-accent">$47.32</p>
        </div>

        <div className="p-3 rounded-lg bg-surface-light border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Managed by</p>
          </div>
          <p className="text-sm font-semibold text-foreground">Sarah Johnson</p>
        </div>

        <Button 
          onClick={() => console.log("View Dust Pool clicked")}
          className="w-full bg-primary hover:bg-primary-dark text-primary-foreground"
        >
          View Dust Pool
        </Button>
      </div>
    </div>
  )
}
