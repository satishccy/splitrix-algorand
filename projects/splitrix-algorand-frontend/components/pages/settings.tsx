"use client"

import { useState } from "react"
import { Bell, Lock, User, Palette, LogOut } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: true,
    twoFactor: false,
  })

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Settings</h1>
        <p className="text-foreground-muted mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="glass p-6 border border-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
            <span className="text-primary-foreground text-2xl font-bold">U</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">User Profile</h3>
            <p className="text-sm text-foreground-muted">user@example.com</p>
          </div>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary-dark">
          <User size={18} />
          Edit Profile
        </Button>
      </Card>

      {/* Preferences */}
      <Card className="glass p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Preferences</h3>
        <div className="space-y-4">
          {[
            {
              icon: Bell,
              label: "Push Notifications",
              key: "notifications",
            },
            {
              icon: Bell,
              label: "Email Alerts",
              key: "emailAlerts",
            },
            {
              icon: Palette,
              label: "Dark Mode",
              key: "darkMode",
            },
          ].map((pref) => {
            const Icon = pref.icon
            return (
              <div
                key={pref.key}
                className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className="text-primary" />
                  <span className="font-medium text-foreground">{pref.label}</span>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      [pref.key]: !settings[pref.key as keyof typeof settings],
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings[pref.key as keyof typeof settings] ? "bg-primary" : "bg-surface-light"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-foreground transition-transform ${
                      settings[pref.key as keyof typeof settings] ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Security */}
      <Card className="glass p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Security</h3>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full border-border hover:bg-surface-light justify-start bg-transparent"
          >
            <Lock size={18} />
            Change Password
          </Button>
          <Button
            variant="outline"
            className="w-full border-border hover:bg-surface-light justify-start bg-transparent"
          >
            <Lock size={18} />
            Two-Factor Authentication
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="glass p-6 border border-destructive/30 bg-destructive/5">
        <h3 className="text-lg font-bold text-destructive mb-4">Danger Zone</h3>
        <Button
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive/10 justify-start bg-transparent"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </Card>
    </div>
  )
}
