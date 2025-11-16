"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, Users, Receipt, Wallet, AlertCircle, TrendingUp, DollarSign, CheckCircle, Clock, Send } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { AddressDisplay } from "@/components/common/AddressDisplay"
import { useWallet } from "@txnlab/use-wallet-react"
import { groupsApi, analyticsApi } from "@/lib/api"
import { CreateBillModal } from "@/components/bills/create-bill-modal"
import WalletConnectModal from "@/components/wallet/WalletConnectModal"
import { toast } from "sonner"
import { useContractService } from "@/services/contractService"

// Helper to format microAlgos to ALGO
const formatAmount = (microAlgos: bigint | number | string): string => {
  const amount = typeof microAlgos === 'string' ? BigInt(microAlgos) : BigInt(microAlgos || 0)
  const algos = Number(amount) / 1_000_000
  return `${algos.toFixed(6)} ALGO`
}

// Helper to determine bill status
const getBillStatus = (bill: any): "pending" | "settled" => {
  if (!bill.debtors || bill.debtors.length === 0) return "settled"
  
  const allSettled = bill.debtors.every((debtor: any) => {
    const amount = typeof debtor.amount === 'bigint' ? debtor.amount : BigInt(debtor.amount || 0)
    const paid = typeof debtor.paid === 'bigint' ? debtor.paid : BigInt(debtor.paid || 0)
    return paid >= amount
  })
  
  return allSettled ? "settled" : "pending"
}

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  const { activeAccount } = useWallet()
  const [group, setGroup] = useState<any>(null)
  const [bills, setBills] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [billsLoading, setBillsLoading] = useState(false)
  const [isCreateBillOpen, setIsCreateBillOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "pending" | "settled">("all")
  const [settlingBillId, setSettlingBillId] = useState<string | null>(null)
  const contractService = useContractService()

  useEffect(() => {
    if (activeAccount?.address) {
      loadGroupData()
    } else {
      setLoading(false)
    }
  }, [groupId, activeAccount?.address])

  const loadGroupData = async () => {
    if (!activeAccount?.address) return

    try {
      setLoading(true)
      const [groupData, billsData, analyticsData] = await Promise.all([
        groupsApi.getById(groupId),
        groupsApi.getBills(groupId),
        analyticsApi.getGroupAnalytics(groupId),
      ])
      setGroup(groupData)
      setBills(billsData || [])
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load group data:', error)
      toast.error('Failed to load group data')
    } finally {
      setLoading(false)
    }
  }

  const loadBills = async () => {
    if (!activeAccount?.address) return

    try {
      setBillsLoading(true)
      const billsData = await groupsApi.getBills(groupId)
      setBills(billsData || [])
      // Reload analytics when bills change
      const analyticsData = await analyticsApi.getGroupAnalytics(groupId)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load bills:', error)
      toast.error('Failed to load bills')
    } finally {
      setBillsLoading(false)
    }
  }

  const handleSettleBill = async (bill: any, debtorIndex: number) => {
    if (!contractService || !activeAccount?.address) {
      toast.error('Please connect your wallet')
      return
    }

    const debtor = bill.debtors[debtorIndex]
    const amountOwed = BigInt(debtor.amount) - BigInt(debtor.paid)
    
    if (amountOwed <= 0) {
      toast.error('This bill is already settled')
      return
    }

    try {
      setSettlingBillId(bill.id)
      toast.loading('Processing payment...', { id: 'settle-bill' })

      const result = await contractService.settleBill({
        groupId: bill.groupId,
        billId: bill.billId,
        senderIndex: debtorIndex,
        amount: amountOwed,
        payerAddress: bill.payer,
      })

      toast.success(`Payment successful! Tx ID: ${result.txId.substring(0, 10)}...`, { id: 'settle-bill' })
      
      // Reload bills and analytics after successful settlement
      await loadBills()
    } catch (error) {
      console.error('Failed to settle bill:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to settle bill', { id: 'settle-bill' })
    } finally {
      setSettlingBillId(null)
    }
  }

  if (!activeAccount) {
    return (
      <AppLayout>
        <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Wallet className="w-16 h-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground">Connect Your Wallet</h2>
          <p className="text-muted-foreground">Please connect your wallet to view group details</p>
          <Button 
            onClick={() => setIsWalletModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary-dark"
          >
            <Wallet size={20} className="mr-2" />
            Connect Wallet
          </Button>
        </div>
        <WalletConnectModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
        </div>
      </AppLayout>
    )
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading group...</p>
        </div>
        </div>
      </AppLayout>
    )
  }

  if (!group) {
    return (
      <AppLayout>
        <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
          <h2 className="text-2xl font-bold text-foreground">Group Not Found</h2>
          <p className="text-muted-foreground">The group you're looking for doesn't exist</p>
          <Button onClick={() => router.push('/groups')} className="bg-primary text-primary-foreground hover:bg-primary-dark">
            <ArrowLeft size={20} className="mr-2" />
            Back to Groups
          </Button>
        </div>
        </div>
      </AppLayout>
    )
  }

  const memberCount = group.memberCount || group.members?.length || 0
  const billCount = bills.length
  const createdAt = group.createdAt ? new Date(group.createdAt).toLocaleDateString() : "Unknown"
  const isAdmin = group.admin === activeAccount.address

  // Filter bills
  const processedBills = bills.map((bill) => ({
    ...bill,
    status: getBillStatus(bill),
    createdAt: bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : "Unknown",
  }))

  const filteredBills = processedBills.filter((bill) => {
    const matchesFilter = filterType === "all" || bill.status === filterType
    if (!matchesFilter) return false
    
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    const memo = bill.memo?.toLowerCase() || ""
    const billId = bill.billId?.toLowerCase() || ""
    const payer = bill.payer?.toLowerCase() || ""
    
    return memo.includes(searchLower) || billId.includes(searchLower) || payer.includes(searchLower)
  })

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => router.push('/groups')}
          className="bg-surface-light hover:bg-surface border border-border text-foreground"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-2">Group {group.id}</h1>
          <p className="text-muted-foreground">Created {createdAt}</p>
        </div>
        <Button
          onClick={() => setIsCreateBillOpen(true)}
          className="bg-primary hover:bg-primary-dark text-primary-foreground flex items-center gap-2"
          disabled={billsLoading}
        >
          <Plus size={20} />
          Create Bill
        </Button>
      </div>

      {/* Group Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <DollarSign className="text-primary" size={20} />
            </div>
            <p className="text-2xl font-bold text-foreground">{formatAmount(analytics.totalSpent)}</p>
          </div>
          
          <div className="glass rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Bills</p>
              <Receipt className="text-accent" size={20} />
            </div>
            <p className="text-2xl font-bold text-foreground">{analytics.billCount}</p>
          </div>
          
          <div className="glass rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Members</p>
              <Users className="text-success" size={20} />
            </div>
            <p className="text-2xl font-bold text-foreground">{analytics.memberCount}</p>
          </div>
          
          <div className="glass rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Pending Bills</p>
              <Clock className="text-warning" size={20} />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {bills.filter(b => getBillStatus(b) === "pending").length}
            </p>
          </div>
        </div>
      )}

      {/* Member Analytics */}
      {analytics?.spendingByMember && analytics.spendingByMember.length > 0 && (
        <div className="glass rounded-xl p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Member Analytics
          </h2>
          <div className="space-y-3">
            {analytics.spendingByMember.map((member: any, idx: number) => {
              const netBalance = typeof member.netBalance === 'bigint' 
                ? member.netBalance 
                : BigInt(member.netBalance || 0)
              const isPositive = netBalance > BigInt(0)
              const isZero = netBalance === BigInt(0)
              
              return (
                <div key={idx} className="p-4 rounded-lg bg-surface-light border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <AddressDisplay address={member.address} showFull={false} />
                    {member.address === activeAccount.address && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                        You
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Total Paid</p>
                      <p className="font-semibold text-foreground">{formatAmount(member.totalPaid)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Owed to Them</p>
                      <p className="font-semibold text-success">{formatAmount(member.totalOwed)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">They Owe</p>
                      <p className="font-semibold text-warning">{formatAmount(member.totalOwes)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Net Balance</p>
                      <p className={`font-semibold ${isPositive ? 'text-success' : isZero ? 'text-muted-foreground' : 'text-warning'}`}>
                        {isPositive ? '+' : ''}{formatAmount(netBalance)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Group Info */}
      <div className="glass rounded-xl p-6 border border-border space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-accent" />
          <span className="text-lg font-semibold text-foreground">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
          {billCount > 0 && (
            <>
              <span className="text-muted-foreground">•</span>
              <Receipt size={20} className="text-accent" />
              <span className="text-lg font-semibold text-foreground">
                {billCount} {billCount === 1 ? "bill" : "bills"}
              </span>
            </>
          )}
        </div>

        {/* Admin */}
        <div className="p-4 rounded-lg bg-surface-light border border-border">
          <p className="text-sm text-muted-foreground mb-2">Group Admin</p>
          <AddressDisplay address={group.admin} showFull={false} />
          {isAdmin && (
            <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
              You
            </span>
          )}
        </div>

        {/* Members */}
        {group.members && group.members.length > 0 && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-3">Members</p>
            <div className="flex flex-wrap gap-2">
              {group.members.map((member: any, idx: number) => (
                <div key={idx} className="px-3 py-2 rounded-lg bg-surface-light border border-border">
                  <AddressDisplay 
                    address={member.address} 
                    showFull={false} 
                    className="text-sm"
                    showAddressBelow={false}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bills Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Bills</h2>
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-4 border border-border flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search bills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "pending", "settled"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-light border border-border text-foreground hover:border-primary/50"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Bills List */}
        <div className="space-y-3">
          {billsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading bills...</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="glass rounded-xl p-12 border border-border text-center">
              <p className="text-muted-foreground">
                {bills.length === 0 
                  ? "No bills found. Create your first bill to get started!" 
                  : "No bills found matching your filters"}
              </p>
            </div>
          ) : (
            filteredBills.map((bill) => {
              const isPayer = bill.payer === activeAccount.address
              const totalAmount = typeof bill.totalAmount === 'bigint' ? bill.totalAmount : BigInt(bill.totalAmount || 0)
              const currentUserDebtor = bill.debtors?.find((d: any) => d.address === activeAccount.address)
              
              return (
                <div
                  key={bill.id}
                  className="glass rounded-xl p-5 border border-border hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-foreground truncate">
                          {bill.memo || `Bill ${bill.billId || bill.id}`}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                            bill.status === "settled"
                              ? "bg-success/10 border-success/30 text-success"
                              : "bg-warning/10 border-warning/30 text-warning"
                          }`}
                        >
                          {bill.status === "settled" ? <CheckCircle size={14} /> : <Clock size={14} />}
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <span>Paid by:</span>
                        <AddressDisplay address={bill.payer} showFull={false} className="text-sm" />
                        {isPayer && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-2xl font-bold text-primary mb-1">{formatAmount(totalAmount)}</p>
                      <p className="text-xs text-muted-foreground">{bill.createdAt}</p>
                    </div>
                  </div>

                  {/* Debtors Status */}
                  {bill.debtors && bill.debtors.length > 0 && (
                    <div className="p-4 rounded-lg bg-surface-light border border-border">
                      <p className="text-sm font-semibold text-foreground mb-3">Payment Status</p>
                      <div className="space-y-2">
                        {bill.debtors.map((debtor: any, idx: number) => {
                          const debtorAmount = typeof debtor.amount === 'bigint' ? debtor.amount : BigInt(debtor.amount || 0)
                          const debtorPaid = typeof debtor.paid === 'bigint' ? debtor.paid : BigInt(debtor.paid || 0)
                          const pending = debtorAmount - debtorPaid
                          const isFullyPaid = debtorPaid >= debtorAmount
                          const paymentPercentage = debtorAmount > 0 
                            ? Math.min(100, Math.round((Number(debtorPaid) / Number(debtorAmount)) * 100))
                            : 0
                          const isCurrentUser = debtor.address === activeAccount.address
                          const isSettling = settlingBillId === bill.id
                          
                          return (
                            <div
                              key={idx}
                              className="flex items-start justify-between p-3 rounded-lg bg-surface border border-border"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <AddressDisplay 
                                  address={debtor.address} 
                                  showFull={false} 
                                  className="text-sm"
                                  showAddressBelow={false}
                                />
                                {isCurrentUser && (
                                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="text-right">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-sm font-semibold ${isFullyPaid ? 'text-success' : 'text-warning'}`}>
                                      {formatAmount(debtorPaid)} / {formatAmount(debtorAmount)}
                                    </span>
                                    {isFullyPaid ? (
                                      <CheckCircle size={16} className="text-success" />
                                    ) : (
                                      <Clock size={16} className="text-warning" />
                                    )}
                                  </div>
                                  {!isFullyPaid && (
                                    <p className="text-xs text-muted-foreground">
                                      Pending: {formatAmount(pending)}
                                    </p>
                                  )}
                                  {/* Progress bar */}
                                  <div className="w-32 h-1.5 bg-surface-light rounded-full mt-2 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all ${isFullyPaid ? 'bg-success' : 'bg-warning'}`}
                                      style={{ width: `${paymentPercentage}%` }}
                                    />
                                  </div>
                                </div>
                                {/* Pay button for current user */}
                                {isCurrentUser && !isFullyPaid && (
                                  <Button
                                    onClick={() => handleSettleBill(bill, idx)}
                                    disabled={isSettling}
                                    className="bg-success hover:bg-success/90 text-white text-xs px-3 py-1 h-auto"
                                  >
                                    {isSettling ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1"></div>
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <Send size={14} className="mr-1" />
                                        Pay {formatAmount(pending)}
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Your share info */}
                  {!isPayer && currentUserDebtor && (
                    <div className="mt-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Your Share</p>
                          <p className="text-lg font-bold text-primary">
                            {formatAmount(currentUserDebtor.amount)}
                          </p>
                          {currentUserDebtor.paid < currentUserDebtor.amount ? (
                            <p className="text-sm text-warning mt-1">
                              You still owe: {formatAmount(BigInt(currentUserDebtor.amount) - BigInt(currentUserDebtor.paid))}
                            </p>
                          ) : (
                            <p className="text-sm text-success mt-1 flex items-center gap-1">
                              <CheckCircle size={14} />
                              Fully paid
                            </p>
                          )}
                        </div>
                        {currentUserDebtor.paid < currentUserDebtor.amount && (
                          <Button
                            onClick={() => {
                              const debtorIndex = bill.debtors.findIndex((d: any) => d.address === activeAccount.address)
                              if (debtorIndex >= 0) handleSettleBill(bill, debtorIndex)
                            }}
                            disabled={settlingBillId === bill.id}
                            className="bg-success hover:bg-success/90 text-white"
                          >
                            {settlingBillId === bill.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <Send size={16} className="mr-2" />
                                Pay Now
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Create Bill Modal */}
      <CreateBillModal 
        isOpen={isCreateBillOpen} 
        onClose={() => setIsCreateBillOpen(false)} 
        onSuccess={loadBills}
        groupId={groupId}
        groupMembers={group.members || []}
      />
      
      {/* Wallet Connect Modal */}
      <WalletConnectModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      </div>
    </AppLayout>
  )
}

