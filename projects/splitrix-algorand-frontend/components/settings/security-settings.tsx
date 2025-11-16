import { Button } from "@/components/ui/button"

export function SecuritySettings() {
  return (
    <div className="glass rounded-xl p-6 border border-border space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Security Settings</h3>

        <div className="space-y-4">
          {/* Password */}
          <div className="p-4 rounded-lg bg-surface-light border border-border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Password</p>
                <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
              </div>
              <Button className="bg-primary hover:bg-primary-dark text-primary-foreground text-sm">Change</Button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="p-4 rounded-lg bg-surface-light border border-border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm">Enable</Button>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="p-4 rounded-lg bg-surface-light border border-border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Active Sessions</p>
                <p className="text-xs text-muted-foreground">Manage your active sessions</p>
              </div>
              <Button className="bg-surface hover:bg-surface-light border border-border text-foreground text-sm">
                View
              </Button>
            </div>
          </div>

          {/* Connected Wallets */}
          <div className="p-4 rounded-lg bg-surface-light border border-border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Connected Wallets</p>
                <p className="text-xs text-muted-foreground">Manage your Web3 wallet connections</p>
              </div>
              <Button className="bg-primary hover:bg-primary-dark text-primary-foreground text-sm">
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
