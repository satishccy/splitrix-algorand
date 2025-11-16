"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GroupsList } from "@/components/groups/groups-list"
import { CreateGroupModal } from "@/components/groups/create-group-modal"
import { useWallet } from "@txnlab/use-wallet-react"
import { groupsApi } from "@/lib/api"
import WalletConnectModal from "@/components/wallet/WalletConnectModal"
import { AppLayout } from "@/components/layout/app-layout"

export default function GroupsPage() {
  const { activeAccount } = useWallet()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activeAccount?.address) {
      loadGroups()
    } else {
      setLoading(false)
    }
  }, [activeAccount?.address])

  const loadGroups = async () => {
    if (!activeAccount?.address) return

    try {
      setLoading(true)
      const userGroups = await groupsApi.getAll(activeAccount.address)
      setGroups(userGroups)
    } catch (error) {
      console.error('Failed to load groups:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!activeAccount) {
    return (
      <AppLayout>
        <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Wallet className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground">Connect Your Wallet</h2>
            <p className="text-muted-foreground">Please connect your wallet to view your groups</p>
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

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Groups</h1>
          <p className="text-muted-foreground">Manage group expenses and funds</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary-dark text-primary-foreground flex items-center gap-2"
          disabled={loading}
        >
          <Plus size={20} />
          Create Group
        </Button>
      </div>

      {/* Search */}
      <div className="glass rounded-xl p-4 border border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Groups List */}
      <GroupsList 
        searchQuery={searchQuery} 
        groups={groups} 
        loading={loading}
      />

      {/* Create Group Modal */}
      <CreateGroupModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={loadGroups} />
      
      {/* Wallet Connect Modal */}
      <WalletConnectModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      </div>
    </AppLayout>
  )
}

