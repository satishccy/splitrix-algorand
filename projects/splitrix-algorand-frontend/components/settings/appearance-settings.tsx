"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Palette } from "lucide-react"

export function AppearanceSettings() {
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    theme: "dark",
    accentColor: "yellow",
    fontSize: "Normal"
  })

  const handleSavePreferences = async () => {
    setIsSaving(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log("Appearance settings saved:", settings)
      setIsSaving(false)
    }, 1000)
  }

  const updateSetting = (key: string, value: string) => {
    setSettings({...settings, [key]: value})
  }

  return (
    <div className="glass rounded-xl p-6 border border-border space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Appearance</h3>

        <div className="space-y-4">
          {/* Theme */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Theme</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "dark", label: "Dark", color: "bg-black" },
                { id: "light", label: "Light", color: "bg-white" },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => updateSetting("theme", theme.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.theme === theme.id
                      ? "border-primary bg-surface-light"
                      : "border-border bg-surface-light hover:border-primary/50"
                  }`}
                >
                  <div className={`w-full h-12 rounded ${theme.color} mb-2`} />
                  <p className="text-sm font-semibold text-foreground">{theme.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Accent Color</label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { id: "yellow", color: "bg-primary" },
                { id: "cyan", color: "bg-accent" },
                { id: "purple", color: "bg-accent-secondary" },
                { id: "green", color: "bg-success" },
              ].map((accent) => (
                <button
                  key={accent.id}
                  onClick={() => updateSetting("accentColor", accent.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.accentColor === accent.id ? "border-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-full h-8 rounded ${accent.color}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Font Size</label>
            <div className="flex gap-2">
              {["Small", "Normal", "Large"].map((size) => (
                <button
                  key={size}
                  onClick={() => updateSetting("fontSize", size)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    settings.fontSize === size
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-light border border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="w-full bg-primary hover:bg-primary-dark text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                Saving Preferences...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Palette size={18} />
                Save Preferences
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
