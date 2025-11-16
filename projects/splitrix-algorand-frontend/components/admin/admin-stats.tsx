import { TrendingUp, Users, DollarSign, AlertCircle } from "lucide-react"

export function AdminStats() {
  const stats = [
    {
      title: "Total Users",
      value: "24",
      change: "+3 this month",
      icon: Users,
      color: "text-accent",
    },
    {
      title: "Total Transactions",
      value: "156",
      change: "+42 this month",
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      title: "Total Volume",
      value: "$12,450.50",
      change: "+$2,340 this month",
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Pending Issues",
      value: "3",
      change: "Requires attention",
      icon: AlertCircle,
      color: "text-warning",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="glass rounded-xl p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                </div>
                <div className="p-3 rounded-lg bg-surface-light border border-border">
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="glass rounded-xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: "New user registered", user: "Taylor Brown", time: "2 hours ago" },
            { action: "Large transaction", user: "Vegas Trip Fund", time: "4 hours ago" },
            { action: "Voting completed", user: "Project Budget", time: "1 day ago" },
            { action: "Group created", user: "Office Lunch Club", time: "2 days ago" },
          ].map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-surface-light border border-border"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.user}</p>
              </div>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
