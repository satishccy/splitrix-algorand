"use client"

import { MoreVertical, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { AddressDisplay } from "@/components/common/AddressDisplay"
import { useWallet } from "@txnlab/use-wallet-react"

interface BillsListProps {
  filterType: "all" | "pending" | "settled"
  searchQuery: string
  bills?: any[]
  loading?: boolean
}

// Helper to format microAlgos to ALGO
const formatAmount = (microAlgos: bigint | number | string): string => {
  const amount = typeof microAlgos === 'string' ? BigInt(microAlgos) : BigInt(microAlgos || 0)
  const algos = Number(amount) / 1_000_000
  return `${algos.toFixed(6)} ALGO`
}

// Helper to determine bill status
const getBillStatus = (bill: any, currentAddress: string): "pending" | "settled" => {
  if (!bill.debtors || bill.debtors.length === 0) return "settled"
  
  // Check if all debtors have paid their full amount
  const allSettled = bill.debtors.every((debtor: any) => {
    const amount = typeof debtor.amount === 'bigint' ? debtor.amount : BigInt(debtor.amount || 0)
    const paid = typeof debtor.paid === 'bigint' ? debtor.paid : BigInt(debtor.paid || 0)
    return paid >= amount
  })
  
  return allSettled ? "settled" : "pending"
}

// Helper to get user's share in a bill
const getUserShare = (bill: any, currentAddress: string): { amount: bigint; paid: bigint; pending: bigint } => {
  if (bill.payer === currentAddress) {
    // User is the payer - they're owed money
    const totalOwed = bill.debtors?.reduce((sum: bigint, d: any) => {
      const amount = typeof d.amount === 'bigint' ? d.amount : BigInt(d.amount || 0)
      return sum + amount
    }, BigInt(0)) || BigInt(0)
    return { amount: totalOwed, paid: BigInt(0), pending: totalOwed }
  }
  
  // User is a debtor
  const debtor = bill.debtors?.find((d: any) => d.address === currentAddress)
  if (!debtor) {
    return { amount: BigInt(0), paid: BigInt(0), pending: BigInt(0) }
  }
  
  const amount: bigint = typeof debtor.amount === 'bigint' 
    ? debtor.amount 
    : BigInt(String(debtor.amount || 0))
  const paid: bigint = typeof debtor.paid === 'bigint' 
    ? debtor.paid 
    : BigInt(String(debtor.paid || 0))
  const pending: bigint = amount > paid ? amount - paid : BigInt(0)
  
  return { amount, paid, pending }
}

export function BillsList({ filterType, searchQuery, bills = [], loading = false }: BillsListProps) {
  const { activeAccount } = useWallet()
  const currentAddress = activeAccount?.address || ""

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading bills...</p>
      </div>
    )
  }

  if (bills.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No bills found. Create your first bill to get started!</p>
      </div>
    )
  }

  // Process bills and add computed fields
  const processedBills = bills.map((bill) => {
    const status = getBillStatus(bill, currentAddress)
    const userShare = getUserShare(bill, currentAddress)
    const createdAt = bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : "Unknown"
    
    return {
      ...bill,
      status,
      userShare,
      createdAt,
    }
  })

  const filteredBills = processedBills.filter((bill) => {
    const matchesFilter = filterType === "all" || bill.status === filterType
    if (!matchesFilter) return false
    
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    const memo = bill.memo?.toLowerCase() || ""
    const groupId = bill.groupId?.toLowerCase() || ""
    const billId = bill.billId?.toLowerCase() || ""
    const payer = bill.payer?.toLowerCase() || ""
    
    return memo.includes(searchLower) || groupId.includes(searchLower) || billId.includes(searchLower) || payer.includes(searchLower)
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "settled":
        return <CheckCircle size={18} className="text-success" />
      case "pending":
        return <Clock size={18} className="text-warning" />
      default:
        return <AlertCircle size={18} className="text-destructive" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "settled":
        return "bg-success/10 border-success/30 text-success"
      case "pending":
        return "bg-warning/10 border-warning/30 text-warning"
      default:
        return "bg-destructive/10 border-destructive/30 text-destructive"
    }
  }

  return (
    <div className="space-y-3">
      {filteredBills.length === 0 ? (
        <div className="glass rounded-xl p-12 border border-border text-center">
          <p className="text-muted-foreground">No bills found matching your filters</p>
        </div>
      ) : (
        filteredBills.map((bill) => {
          const isPayer = bill.payer === currentAddress
          const totalAmount = typeof bill.totalAmount === 'bigint' ? bill.totalAmount : BigInt(bill.totalAmount || 0)
          const userShareInfo = bill.userShare
          
          return (
            <div
              key={bill.id}
              className="glass rounded-xl p-4 border border-border hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-foreground truncate">
                      {bill.memo || `Bill ${bill.billId || bill.id}`}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(bill.status)}`}
                    >
                      {getStatusIcon(bill.status)}
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Group:</span>
                      <span className="font-mono text-xs">{bill.groupId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Paid by:</span>
                      <AddressDisplay address={bill.payer} showFull={false} className="text-sm" />
                    </div>
                  </div>

                  {/* Debtors */}
                  {bill.debtors && bill.debtors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {bill.debtors.slice(0, 5).map((debtor: any, idx: number) => {
                        const debtorAmount = typeof debtor.amount === 'bigint' ? debtor.amount : BigInt(debtor.amount || 0)
                        const debtorPaid = typeof debtor.paid === 'bigint' ? debtor.paid : BigInt(debtor.paid || 0)
                        const isSettled = debtorPaid >= debtorAmount
                        
                        return (
                          <div
                            key={idx}
                            className="px-2 py-1 rounded-lg bg-surface-light border border-border text-xs"
                          >
                            <AddressDisplay 
                              address={debtor.address} 
                              showFull={false} 
                              className="text-xs"
                              showAddressBelow={false}
                            />
                            <span className="text-muted-foreground ml-1">
                              ({formatAmount(debtorAmount)} {isSettled ? "✓" : ""})
                            </span>
                          </div>
                        )
                      })}
                      {bill.debtors.length > 5 && (
                        <span className="px-2 py-1 rounded-lg bg-surface-light border border-border text-xs text-muted-foreground">
                          +{bill.debtors.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="text-right ml-4 shrink-0">
                  <p className="text-2xl font-bold text-primary mb-1">{formatAmount(totalAmount)}</p>
                  {isPayer ? (
                    <p className="text-sm text-success mb-1">You paid this bill</p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-1">
                        Your share: {formatAmount(userShareInfo.amount)}
                      </p>
                      {userShareInfo.pending > BigInt(0) && (
                        <p className="text-sm text-warning mb-1">
                          Pending: {formatAmount(userShareInfo.pending)}
                        </p>
                      )}
                      {userShareInfo.pending === BigInt(0) && userShareInfo.amount > BigInt(0) && (
                        <p className="text-sm text-success mb-1">✓ Settled</p>
                      )}
                    </>
                  )}
                  <p className="text-xs text-muted-foreground mb-3">{bill.createdAt}</p>
                  <button className="p-2 rounded-lg hover:bg-surface-light transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical size={18} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
