"use client"

import { useState } from "react"
import { Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnalyticsWidget } from "@/components/dashboard/analytics-widget"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")

  const stats = [
    {
      title: "Total Expenses",
      value: "$9,100.00",
      change: "+12.5%",
      icon: "📊",
    },
    {
      title: "Average Per Bill",
      value: "$58.33",
      change: "-2.3%",
      icon: "💰",
    },
    {
      title: "Largest Expense",
      value: "$450.00",
      change: "Vegas Trip",
      icon: "📈",
    },
    {
      title: "Bills This Period",
      value: "156",
      change: "+42 bills",
      icon: "📋",
    },
  ]

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Reports</h1>
          <p className="text-muted-foreground">Track your spending patterns and insights</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-surface-light hover:bg-surface border border-border text-foreground flex items-center gap-2">
            <Filter size={20} />
            Filter
          </Button>
          <Button className="bg-primary hover:bg-primary-dark text-primary-foreground flex items-center gap-2">
            <Download size={20} />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range */}
      <div className="glass rounded-xl p-4 border border-border flex gap-2">
        {(["week", "month", "year"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === range
                ? "bg-primary text-primary-foreground"
                : "bg-surface-light border border-border text-foreground hover:border-primary/50"
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass rounded-xl p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-xs text-primary font-semibold">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <AnalyticsWidget />

      {/* Top Spenders */}
      <div className="glass rounded-xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Top Spenders</h3>
        <div className="space-y-3">
          {[
            { name: "Food & Dining", amount: "$1,200", percentage: 35 },
            { name: "Entertainment", amount: "$800", percentage: 23 },
            { name: "Travel", amount: "$600", percentage: 18 },
            { name: "Utilities", amount: "$400", percentage: 12 },
            { name: "Other", amount: "$300", percentage: 12 },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm font-bold text-primary">{item.amount}</p>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-surface-light border border-border">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground w-12 text-right">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
