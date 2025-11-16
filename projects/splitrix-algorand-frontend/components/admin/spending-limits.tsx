import { AlertCircle } from "lucide-react"

export function SpendingLimits() {
  const limits = [
    {
      id: 1,
      user: "Sarah Johnson",
      limit: "$500.00",
      spent: "$340.50",
      percentage: 68,
      status: "warning",
    },
    {
      id: 2,
      user: "Alex Kim",
      limit: "$300.00",
      spent: "$120.00",
      percentage: 40,
      status: "ok",
    },
    {
      id: 3,
      user: "Jordan Martinez",
      limit: "$400.00",
      spent: "$395.00",
      percentage: 99,
      status: "critical",
    },
    {
      id: 4,
      user: "Sam Wilson",
      limit: "$250.00",
      spent: "$85.75",
      percentage: 34,
      status: "ok",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-destructive/10 border-destructive/30"
      case "warning":
        return "bg-warning/10 border-warning/30"
      default:
        return "bg-success/10 border-success/30"
    }
  }

  return (
    <div className="space-y-4">
      {limits.map((limit) => (
        <div key={limit.id} className={`glass rounded-xl p-6 border ${getStatusColor(limit.status)}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">{limit.user}</h3>
              <p className="text-sm text-muted-foreground">Monthly spending limit</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{limit.limit}</p>
              <p className="text-sm text-muted-foreground">Spent: {limit.spent}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-foreground">{limit.percentage}% Used</span>
              <span className="text-xs text-muted-foreground">
                ${limit.spent} / {limit.limit}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-surface-light border border-border">
              <div
                className={`h-full transition-all ${
                  limit.percentage > 90 ? "bg-destructive" : limit.percentage > 70 ? "bg-warning" : "bg-success"
                }`}
                style={{ width: `${limit.percentage}%` }}
              />
            </div>
          </div>

          {limit.status !== "ok" && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-surface-light border border-border">
              <AlertCircle size={16} className="text-warning flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                {limit.status === "critical"
                  ? "User is approaching spending limit"
                  : "User has exceeded 70% of spending limit"}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
