"use client"

import { useState, useEffect } from "react"
import { X, Plus, Minus, AlertCircle, UserPlus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@txnlab/use-wallet-react"
import { useContractService } from "@/services/contractService"
import { helpersApi } from "@/lib/api"
import { AddressDisplay } from "@/components/common/AddressDisplay"
import { useFriends } from "@/contexts/FriendsContext"
import algosdk from "algosdk"
import { toast } from "sonner"

interface CreateBillModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  groupId?: string
  groupMembers?: Array<{ address: string }>
}

interface Debtor {
  address: string
  amount: number // in microAlgos
  nickname?: string
}

export function CreateBillModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  groupId,
  groupMembers = []
}: CreateBillModalProps) {
  const { activeAccount } = useWallet()
  const contractService = useContractService()
  const { friends } = useFriends()
  
  const [memo, setMemo] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal")
  const [debtors, setDebtors] = useState<Debtor[]>([])
  const [showFriendSelector, setShowFriendSelector] = useState(false)
  const [friendSearchQuery, setFriendSearchQuery] = useState("")
  const [manualAddress, setManualAddress] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (isOpen && groupId && groupMembers.length > 0) {
      // Initialize debtors from group members (excluding payer)
      const initialDebtors = groupMembers
        .filter(m => m.address !== activeAccount?.address)
        .map(m => ({
          address: m.address,
          amount: 0,
        }))
      setDebtors(initialDebtors)
    } else if (isOpen) {
      setDebtors([])
    }
  }, [isOpen, groupId, groupMembers, activeAccount?.address])

  useEffect(() => {
    if (!isOpen) {
      // Reset form
      setMemo("")
      setTotalAmount("")
      setSplitType("equal")
      setDebtors([])
      setError("")
      setShowFriendSelector(false)
      setShowManualInput(false)
      setManualAddress("")
      setFriendSearchQuery("")
    }
  }, [isOpen])

  useEffect(() => {
    if (splitType === "equal" && totalAmount && debtors.length > 0) {
      const amount = parseFloat(totalAmount)
      if (!isNaN(amount) && amount > 0) {
        const microAlgos = Math.floor(amount * 1_000_000)
        const perPerson = Math.floor(microAlgos / debtors.length)
        const remainder = microAlgos % debtors.length
        
        setDebtors(debtors.map((debtor, idx) => ({
          ...debtor,
          amount: perPerson + (idx < remainder ? 1 : 0)
        })))
      }
    }
  }, [splitType, totalAmount, debtors.length])

  const validateAlgorandAddress = (address: string): boolean => {
    try {
      if (address.length !== 58) return false
      return algosdk.isValidAddress(address)
    } catch {
      return false
    }
  }

  const isDebtorAdded = (address: string): boolean => {
    return debtors.some(d => d.address === address) || address === activeAccount?.address
  }

  const addDebtor = (address: string, nickname?: string) => {
    if (!address || address.trim() === "") return
    if (address === activeAccount?.address) {
      setError("Cannot add yourself as a debtor")
      return
    }
    if (isDebtorAdded(address)) {
      setError("Debtor already added")
      return
    }
    if (!validateAlgorandAddress(address)) {
      setError("Invalid Algorand address")
      return
    }

    const amount = splitType === "equal" && totalAmount && debtors.length > 0
      ? Math.floor((parseFloat(totalAmount) * 1_000_000) / (debtors.length + 1))
      : 0

    setDebtors([...debtors, { address: address.trim(), amount, nickname }])
    setError("")
    setShowFriendSelector(false)
    setShowManualInput(false)
    setManualAddress("")
    setFriendSearchQuery("")
  }

  const removeDebtor = (address: string) => {
    setDebtors(debtors.filter(d => d.address !== address))
  }

  const updateDebtorAmount = (address: string, amount: number) => {
    setDebtors(debtors.map(d => 
      d.address === address ? { ...d, amount } : d
    ))
  }

  const handleAddFromFriends = (friend: any) => {
    const address = friend.friendAddress || friend.address
    const nickname = friend.nickname
    addDebtor(address, nickname)
  }

  const handleAddManual = () => {
    if (!manualAddress.trim()) {
      setError("Please enter an address")
      return
    }
    addDebtor(manualAddress.trim())
  }

  const handleCreateBill = async () => {
    if (!activeAccount?.address) {
      setError("Please connect your wallet")
      return
    }

    if (!contractService) {
      setError("Wallet not connected or contract service unavailable")
      return
    }

    if (!groupId) {
      setError("Group ID is required")
      return
    }

    if (!memo.trim()) {
      setError("Please enter a memo/description")
      return
    }

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      setError("Please enter a valid total amount")
      return
    }

    if (debtors.length === 0) {
      setError("Please add at least one debtor")
      return
    }

    // Validate all debtors have amounts if custom split
    if (splitType === "custom") {
      const hasInvalidAmounts = debtors.some(d => d.amount <= 0)
      if (hasInvalidAmounts) {
        setError("All debtors must have a valid amount")
        return
      }
    }

    setIsCreating(true)
    setError("")

    try {
      // First, get bill data from helper API
      const helperData = await helpersApi.createBillData({
        groupId,
        payer: activeAccount.address,
        debtors: debtors.map(d => ({
          address: d.address,
          amount: d.amount.toString(),
        })),
        memo: memo.trim(),
      })

      // Then create the bill using contract service
      const result = await contractService.createBill(helperData)

      toast.success(`Bill created successfully! Transaction: ${result.txId.slice(0, 8)}...`)

      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error: any) {
      console.error("Failed to create bill:", error)
      setError(error.message || "Failed to create bill")
      toast.error(error.message || "Failed to create bill")
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  const filteredFriends = friends.filter((friend: any) => {
    if (isDebtorAdded(friend.friendAddress || friend.address)) return false
    if (groupId && groupMembers.length > 0) {
      // If in a group, only show friends who are group members
      const isGroupMember = groupMembers.some(m => 
        m.address === (friend.friendAddress || friend.address)
      )
      if (!isGroupMember) return false
    }
    const searchLower = friendSearchQuery.toLowerCase()
    const address = friend.friendAddress || friend.address || ""
    const nickname = friend.nickname || ""
    return address.toLowerCase().includes(searchLower) || nickname.toLowerCase().includes(searchLower)
  })

  const totalMicroAlgos = debtors.reduce((sum, d) => sum + d.amount, 0)
  const totalAlgos = totalMicroAlgos / 1_000_000
  const inputAlgos = parseFloat(totalAmount) || 0
  const difference = Math.abs(totalAlgos - inputAlgos)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-xl border border-border w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <h2 className="text-2xl font-bold text-foreground">
            {groupId ? "Create Bill in Group" : "Create Bill"}
          </h2>
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

          {/* Bill Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Memo/Description <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Dinner at Restaurant"
                value={memo}
                onChange={(e) => {
                  setMemo(e.target.value)
                  setError("")
                }}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Total Amount (ALGO) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.000001"
                placeholder="0.000000"
                value={totalAmount}
                onChange={(e) => {
                  setTotalAmount(e.target.value)
                  setError("")
                }}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Split Type */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Split Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(["equal", "custom"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSplitType(type)
                    setError("")
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    splitType === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-light border border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Add Debtors */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-foreground">Debtors</label>
              {groupId && groupMembers.length > 0 ? (
                <span className="text-xs text-muted-foreground">
                  {debtors.length} of {groupMembers.filter(m => m.address !== activeAccount?.address).length} members
                </span>
              ) : (
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
              )}
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
                {filteredFriends.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {friendSearchQuery ? "No friends found" : "No friends available"}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredFriends.map((friend: any, index: number) => {
                      const address = friend.friendAddress || friend.address || ""
                      const nickname = friend.nickname || ""

                      return (
                        <button
                          key={index}
                          onClick={() => handleAddFromFriends(friend)}
                          className="w-full flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary/50 transition-all text-left"
                        >
                          <AddressDisplay address={address} showFull={false} showFriendBadge={false} />
                          <Plus size={16} className="text-primary shrink-0 ml-auto" />
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
                    Add Debtor
                  </Button>
                </div>
              </div>
            )}

            {/* Debtors List */}
            <div className="space-y-2">
              {debtors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  <p className="text-sm">No debtors added yet</p>
                  {!groupId && (
                    <p className="text-xs mt-1">Click "Select Friends" or "Add Address" to add debtors</p>
                  )}
                </div>
              ) : (
                debtors.map((debtor, index) => {
                  const amountAlgos = debtor.amount / 1_000_000
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-surface-light border border-border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <AddressDisplay 
                          address={debtor.address} 
                          nickname={debtor.nickname}
                          showFull={false} 
                        />
                      </div>
                      {splitType === "custom" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.000001"
                            placeholder="0.000000"
                            value={amountAlgos || ""}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0
                              updateDebtorAmount(debtor.address, Math.floor(value * 1_000_000))
                            }}
                            className="w-32 px-3 py-1 bg-surface border border-border rounded text-foreground text-sm focus:outline-none focus:border-primary"
                          />
                          <span className="text-sm text-muted-foreground">ALGO</span>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-foreground">
                          {amountAlgos.toFixed(6)} ALGO
                        </span>
                      )}
                      <button
                        onClick={() => removeDebtor(debtor.address)}
                        className="p-1 hover:bg-surface rounded transition-colors"
                      >
                        <Minus size={16} className="text-destructive" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Amount Summary */}
            {debtors.length > 0 && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Split:</span>
                  <span className="font-semibold text-foreground">{totalAlgos.toFixed(6)} ALGO</span>
                </div>
                {difference > 0.000001 && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-warning">Difference:</span>
                    <span className="text-warning">{difference.toFixed(6)} ALGO</span>
                  </div>
                )}
              </div>
            )}
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
            onClick={handleCreateBill}
            disabled={
              isCreating || 
              !activeAccount || 
              !contractService || 
              !groupId ||
              !memo.trim() ||
              !totalAmount ||
              debtors.length === 0
            }
            className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                Creating...
              </div>
            ) : (
              "Create Bill"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
