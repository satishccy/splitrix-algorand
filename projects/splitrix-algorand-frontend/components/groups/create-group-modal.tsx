"use client"

import { useState, useEffect } from "react"
import { X, Plus, Minus, UserPlus, Search, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@txnlab/use-wallet-react"
import { useFriends } from "@/contexts/FriendsContext"
import { useContractService } from "@/services/contractService"
import { AddressDisplay } from "@/components/common/AddressDisplay"
import algosdk from "algosdk"
import { toast } from "sonner"

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface Member {
  address: string
  nickname?: string
}

export function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
  const { activeAccount } = useWallet()
  const contractService = useContractService()
  const { friends, loading: loadingFriends } = useFriends()
  const [members, setMembers] = useState<Member[]>([])
  const [showFriendSelector, setShowFriendSelector] = useState(false)
  const [friendSearchQuery, setFriendSearchQuery] = useState("")
  const [manualAddress, setManualAddress] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setMembers([])
      setError("")
      setManualAddress("")
      setFriendSearchQuery("")
      setShowFriendSelector(false)
      setShowManualInput(false)
    }
  }, [isOpen])

  const validateAlgorandAddress = (address: string): boolean => {
    try {
      if (address.length !== 58) return false
      return algosdk.isValidAddress(address)
    } catch {
      return false
    }
  }

  const isMemberAdded = (address: string): boolean => {
    return members.some(m => m.address === address) || address === activeAccount?.address
  }

  const addMember = (address: string, nickname?: string) => {
    if (!address || address.trim() === "") return
    if (address === activeAccount?.address) {
      setError("Cannot add yourself as a member")
      return
    }
    if (isMemberAdded(address)) {
      setError("Member already added")
      return
    }
    if (!validateAlgorandAddress(address)) {
      setError("Invalid Algorand address")
      return
    }

    setMembers([...members, { address: address.trim(), nickname }])
    setError("")
    setShowFriendSelector(false)
    setShowManualInput(false)
    setManualAddress("")
    setFriendSearchQuery("")
  }

  const removeMember = (address: string) => {
    setMembers(members.filter(m => m.address !== address))
  }

  const handleAddFromFriends = (friend: any) => {
    const address = friend.friendAddress || friend.address
    const nickname = friend.nickname
    addMember(address, nickname)
  }

  const handleAddManual = () => {
    if (!manualAddress.trim()) {
      setError("Please enter an address")
      return
    }
    addMember(manualAddress.trim())
  }

  const handleCreateGroup = async () => {
    if (!activeAccount?.address) {
      setError("Please connect your wallet")
      return
    }

    if (!contractService) {
      setError("Wallet not connected or contract service unavailable")
      return
    }

    if (members.length === 0) {
      setError("Please add at least one member")
      return
    }

    setIsCreating(true)
    setError("")

    try {
      const memberAddresses = members.map(m => m.address)
      
      const result = await contractService.createGroup({
        admin: activeAccount.address,
        members: memberAddresses,
      })

      toast.success(`Group created successfully with ID: ${result.groupId}`)

      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error: any) {
      console.error("Failed to create group:", error)
      setError(error.message || "Failed to create group")
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  const filteredFriends = friends.filter((friend: any) => {
    if (isMemberAdded(friend.friendAddress || friend.address)) return false
    const searchLower = friendSearchQuery.toLowerCase()
    const address = friend.friendAddress || friend.address || ""
    const nickname = friend.nickname || ""
    return address.toLowerCase().includes(searchLower) || nickname.toLowerCase().includes(searchLower)
  })

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-xl border border-border w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <h2 className="text-2xl font-bold text-foreground">Create Group</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-light rounded-lg transition-colors">
            <X size={24} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2">
              <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm text-foreground">
              <strong>You</strong> will be the admin of this group. Add members by selecting from your friends or entering their Algorand addresses.
            </p>
          </div>

          {/* Add Members Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-foreground">Group Members</label>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowFriendSelector(!showFriendSelector)
                    setShowManualInput(false)
                    setError("")
                  }}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2 text-sm"
                  disabled={!activeAccount}
                >
                  <UserPlus size={16} />
                  {showFriendSelector ? "Cancel" : "Select Friends"}
                </Button>
                <Button
                  onClick={() => {
                    setShowManualInput(!showManualInput)
                    setShowFriendSelector(false)
                    setError("")
                  }}
                  className="bg-primary hover:bg-primary-dark text-primary-foreground flex items-center gap-2 text-sm"
                  disabled={!activeAccount}
                >
                  <Plus size={16} />
                  {showManualInput ? "Cancel" : "Add Address"}
                </Button>
              </div>
            </div>

            {/* Friend Selector */}
            {showFriendSelector && (
              <div className="mb-4 p-4 rounded-lg bg-surface-light border border-border">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Search friends..."
                    value={friendSearchQuery}
                    onChange={(e) => setFriendSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                {loadingFriends ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"></div>
                  </div>
                ) : filteredFriends.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {friendSearchQuery ? "No friends found" : friends.length === 0 ? "No friends available. Add friends first!" : "All friends already added"}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredFriends.map((friend: any, index: number) => {
                      const address = friend.friendAddress || friend.address || ""
                      const nickname = friend.nickname || ""
                      const initials = nickname
                        ? nickname.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                        : address.slice(0, 2).toUpperCase()

                      return (
                        <button
                          key={index}
                          onClick={() => handleAddFromFriends(friend)}
                          className="w-full flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary/50 transition-all text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{initials}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <AddressDisplay address={address} showFull={false} showFriendBadge={false} />
                          </div>
                          <Plus size={16} className="text-primary shrink-0" />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Manual Address Input */}
            {showManualInput && (
              <div className="mb-4 p-4 rounded-lg bg-surface-light border border-border">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Algorand Address <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Algorand wallet address (58 characters)"
                      value={manualAddress}
                      onChange={(e) => {
                        setManualAddress(e.target.value)
                        setError("")
                      }}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary font-mono text-sm"
                      maxLength={58}
                    />
                    {manualAddress && !validateAlgorandAddress(manualAddress) && (
                      <p className="text-xs text-destructive mt-1">Invalid address format</p>
                    )}
                  </div>
                  <Button
                    onClick={handleAddManual}
                    disabled={!manualAddress || !validateAlgorandAddress(manualAddress)}
                    className="w-full bg-primary hover:bg-primary-dark text-primary-foreground"
                  >
                    Add Member
                  </Button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="space-y-2">
              {/* Current User (Admin) */}
              {activeAccount && (
                <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">YO</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">You (Admin)</p>
                    <AddressDisplay address={activeAccount.address} showFull={false} showFriendBadge={false} className="text-xs" />
                  </div>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Admin</span>
                </div>
              )}

              {/* Added Members */}
              {members.map((member, index) => {
                const initials = member.nickname
                  ? member.nickname.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                  : member.address.slice(0, 2).toUpperCase()

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-surface-light border border-border rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-accent">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <AddressDisplay address={member.address} nickname={member.nickname} showFull={false} />
                    </div>
                    <button
                      onClick={() => removeMember(member.address)}
                      className="p-1 hover:bg-surface rounded transition-colors"
                    >
                      <Minus size={16} className="text-destructive" />
                    </button>
                  </div>
                )
              })}

              {members.length === 0 && !showFriendSelector && !showManualInput && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No members added yet</p>
                  <p className="text-xs mt-1">Click "Select Friends" or "Add Address" to add members</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-border shrink-0">
          <Button
            onClick={onClose}
            className="flex-1 bg-surface-light hover:bg-surface border border-border text-foreground"
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={isCreating || members.length === 0 || !activeAccount || !contractService}
            className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                Creating...
              </div>
            ) : (
              `Create Group ${members.length > 0 ? `(${members.length + 1} members)` : ""}`
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
