import { ArrowDown, ArrowUp, Receipt } from 'lucide-react'
import { AddressDisplay } from "@/components/common/AddressDisplay"

interface RecentTransactionsProps {
  bills: any[]
  loading: boolean
  currentAddress: string
}

// Helper to format microAlgos to ALGO
const formatAmount = (microAlgos: bigint | number | string): string => {
  const amount = typeof microAlgos === 'string' ? BigInt(microAlgos) : BigInt(microAlgos || 0)
  const algos = Number(amount) / 1_000_000
  return `${algos.toFixed(2)} ALGO`
}

// Helper to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return "Today"
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 7) return `${diffInDays} days ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function RecentTransactions({ bills, loading, currentAddress }: RecentTransactionsProps) {
  // Take the 5 most recent bills
  const recentBills = bills.slice(0, 5)

  if (loading) {
    return (
      <div className="glass rounded-xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Bills</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-light border border-border">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-surface animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-surface animate-pulse rounded" />
                  <div className="h-3 w-20 bg-surface animate-pulse rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-surface animate-pulse rounded ml-auto" />
                <div className="h-3 w-16 bg-surface animate-pulse rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (recentBills.length === 0) {
    return (
      <div className="glass rounded-xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Bills</h3>
        <div className="text-center py-8">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No bills yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first bill to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-6 border border-border">
      <h3 className="text-lg font-bold text-foreground mb-4">Recent Bills</h3>
      <div className="space-y-3">
        {recentBills.map((bill) => {
          const isPayer = bill.payer === currentAddress
          const totalAmount = typeof bill.totalAmount === 'bigint' ? bill.totalAmount : BigInt(bill.totalAmount || 0)
          
          return (
            <div
              key={bill.id}
              className="flex items-center justify-between p-3 rounded-lg bg-surface-light border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isPayer ? 'bg-success/20 border border-success/30' : 'bg-warning/20 border border-warning/30'
                }`}>
                  {isPayer ? (
                    <ArrowUp size={18} className="text-success" />
                  ) : (
                    <ArrowDown size={18} className="text-warning" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {bill.memo || `Bill in Group ${bill.groupId}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isPayer ? 'You paid' : 'You owe'}
                  </p>
                </div>
              </div>
              <div className="text-right ml-3">
                <p className={`text-sm font-bold ${isPayer ? 'text-success' : 'text-warning'}`}>
                  {formatAmount(totalAmount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {bill.createdAt ? formatDate(bill.createdAt) : 'Unknown'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
