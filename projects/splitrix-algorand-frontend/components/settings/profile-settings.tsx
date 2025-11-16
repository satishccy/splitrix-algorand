"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Check, X } from "lucide-react"

export function ProfileSettings() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "You",
    email: "you@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Add a bio about yourself"
  })
  const [avatar, setAvatar] = useState("YU")

  const handleUpdateProfile = async () => {
    setIsUpdating(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log("Profile updated:", profileData)
      setIsUpdating(false)
    }, 1500)
  }

  const handleAvatarChange = () => {
    // In a real implementation, this would open a file picker
    console.log("Avatar change requested")
  }

  return (
    <div className="glass rounded-xl p-6 border border-border space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Profile Information</h3>

        <div className="space-y-4">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{avatar}</span>
              </div>
              <Button 
                onClick={handleAvatarChange}
                className="bg-primary hover:bg-primary-dark text-primary-foreground"
              >
                <Upload size={18} className="mr-2" />
                Change Picture
              </Button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Phone Number</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-primary resize-none"
              rows={3}
            />
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleUpdateProfile}
            disabled={isUpdating}
            className="w-full bg-primary hover:bg-primary-dark text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                Updating Profile...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check size={18} />
                Save Changes
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
