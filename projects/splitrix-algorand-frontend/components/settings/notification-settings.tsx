"use client"

import React from "react"

import { Button } from "@/components/ui/button"

export function NotificationSettings() {
  const [notifications, setNotifications] = React.useState({
    emailBills: true,
    emailSettlements: true,
    emailVoting: false,
    pushBills: true,
    pushSettlements: true,
    pushVoting: false,
  })

  return (
    <div className="glass rounded-xl p-6 border border-border space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Notification Preferences</h3>

        <div className="space-y-4">
          {/* Email Notifications */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Email Notifications</h4>
            <div className="space-y-2">
              {[
                { key: "emailBills", label: "New bills" },
                { key: "emailSettlements", label: "Settlement reminders" },
                { key: "emailVoting", label: "Voting notifications" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-light border border-border cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-border bg-surface cursor-pointer"
                  />
                  <span className="text-sm text-foreground">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Push Notifications */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Push Notifications</h4>
            <div className="space-y-2">
              {[
                { key: "pushBills", label: "New bills" },
                { key: "pushSettlements", label: "Settlement reminders" },
                { key: "pushVoting", label: "Voting notifications" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-light border border-border cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-border bg-surface cursor-pointer"
                  />
                  <span className="text-sm text-foreground">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button className="w-full bg-primary hover:bg-primary-dark text-primary-foreground">Save Preferences</Button>
        </div>
      </div>
    </div>
  )
}
