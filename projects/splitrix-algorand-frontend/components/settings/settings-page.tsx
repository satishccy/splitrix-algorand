"use client"

import { useState } from "react"
import { User, Lock, Bell, Palette, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProfileSettings } from "./profile-settings"
import { SecuritySettings } from "./security-settings"
import { NotificationSettings } from "./notification-settings"
import { AppearanceSettings } from "./appearance-settings"

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "appearance">("profile")

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
  ]

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="glass rounded-xl p-4 border border-border flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-light border border-border text-foreground hover:border-primary/50"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div>
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "security" && <SecuritySettings />}
        {activeTab === "notifications" && <NotificationSettings />}
        {activeTab === "appearance" && <AppearanceSettings />}
      </div>

      {/* Logout */}
      <div className="glass rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Sign Out</h3>
            <p className="text-sm text-muted-foreground">Sign out from your account</p>
          </div>
          <Button className="bg-destructive hover:bg-destructive/90 text-foreground flex items-center gap-2">
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
