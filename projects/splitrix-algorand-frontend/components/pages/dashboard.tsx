"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BalanceCard } from "@/components/dashboard/balance-card"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { useWallet } from "@txnlab/use-wallet-react"
import { balancesApi, billsApi, analyticsApi } from "@/lib/api"
import WalletConnectModal from "@/components/wallet/WalletConnectModal"

// Helper to format microAlgos to ALGO
const formatAmount = (microAlgos: bigint | number | string): string => {
  const amount = typeof microAlgos === 'string' ? BigInt(microAlgos) : BigInt(microAlgos || 0)
  const algos = Number(amount) / 1_000_000
  return algos.toFixed(6)
}

export function Dashboard() {
  const { activeAccount } = useWallet()
  const [showBalance, setShowBalance] = useState(true)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [balanceData, setBalanceData] = useState({
    owes: BigInt(0),
    owed: BigInt(0),
    netBalance: BigInt(0),
  })
  const [bills, setBills] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activeAccount?.address) {
      loadDashboardData()
    } else {
      setLoading(false)
    }
  }, [activeAccount?.address])

  const loadDashboardData = async () => {
    if (!activeAccount?.address) return

    try {
      setLoading(true)
      const [balances, userBills, userAnalytics] = await Promise.all([
        balancesApi.getByAddress(activeAccount.address),
        billsApi.getUserBills(activeAccount.address),
        analyticsApi.getUserAnalytics(activeAccount.address),
      ])

      // Set balance data from API response (values are in microALGOs)
      setBalanceData({
        owes: typeof balances.owes === 'bigint' ? balances.owes : BigInt(balances.owes || 0),
        owed: typeof balances.owed === 'bigint' ? balances.owed : BigInt(balances.owed || 0),
        netBalance: typeof balances.netBalance === 'bigint' ? balances.netBalance : BigInt(balances.netBalance || 0),
      })

      // Combine and sort bills by date
      const allBills = [...(userBills.asPayer || []), ...(userBills.asDebtor || [])]
      const uniqueBills = allBills.filter((bill, index, self) => 
        index === self.findIndex((b) => b.id === bill.id)
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      setBills(uniqueBills)
      setAnalytics(userAnalytics)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!activeAccount) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Wallet className="w-16 h-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground">Connect Your Wallet</h2>
          <p className="text-muted-foreground">Please connect your wallet to view your dashboard</p>
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
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your expense overview.</p>
      </div>

      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BalanceCard
          title="Net Balance"
          amount={showBalance ? `${formatAmount(balanceData.netBalance)} ALGO` : "••••••"}
          icon="wallet"
          variant={balanceData.netBalance >= BigInt(0) ? "success" : "warning"}
          loading={loading}
        />
        <BalanceCard
          title="You Owe"
          amount={showBalance ? `${formatAmount(balanceData.owes)} ALGO` : "••••••"}
          icon="arrow-down"
          variant="warning"
          loading={loading}
        />
        <BalanceCard
          title="You Are Owed"
          amount={showBalance ? `${formatAmount(balanceData.owed)} ALGO` : "••••••"}
          icon="arrow-up"
          variant="success"
          loading={loading}
        />
      </div>

      {/* Toggle Balance Visibility */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowBalance(!showBalance)}
          className="border-border hover:bg-surface-light"
        >
          {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          <span className="ml-2">{showBalance ? "Hide" : "Show"} Balance</span>
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Transactions */}
        <div className="space-y-6">
          <RecentTransactions bills={bills} loading={loading} currentAddress={activeAccount?.address || ''} />
        </div>

        {/* Right Column - Analytics */}
        <div className="space-y-6">
          {analytics && (
            <div className="glass rounded-xl p-6 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Your Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-light border border-border">
                  <span className="text-sm text-muted-foreground">Total Bills Created</span>
                  <span className="text-lg font-bold text-foreground">{analytics.billCount?.asPayer || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-light border border-border">
                  <span className="text-sm text-muted-foreground">Total Bills Involved</span>
                  <span className="text-lg font-bold text-foreground">
                    {(analytics.billCount?.asPayer || 0) + (analytics.billCount?.asDebtor || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-light border border-border">
                  <span className="text-sm text-muted-foreground">Groups</span>
                  <span className="text-lg font-bold text-foreground">{analytics.groupCount || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-light border border-border">
                  <span className="text-sm text-muted-foreground">Total Spent</span>
                  <span className="text-lg font-bold text-primary">{formatAmount(analytics.totalSpent || 0)} ALGO</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Wallet Connect Modal */}
      <WalletConnectModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  )
}
