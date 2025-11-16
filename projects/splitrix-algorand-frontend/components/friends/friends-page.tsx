"use client"

import { useState } from "react"
import { Plus, Search, QrCode, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FriendsList } from "./friends-list"
import { AddFriendModal } from "./add-friend-modal"
import { QrCodeModal } from "./qr-code-modal"
import { useWallet } from "@txnlab/use-wallet-react"
import { useFriends } from "@/contexts/FriendsContext"
import WalletConnectModal from "@/components/wallet/WalletConnectModal"

export function FriendsPage() {
  const { activeAccount } = useWallet()
  const { friends, loading, removeFriend, refreshFriends } = useFriends()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isQrOpen, setIsQrOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleRemoveFriend = async (friendAddress: string) => {
    try {
      await removeFriend(friendAddress)
    } catch (error) {
      console.error('Failed to remove friend:', error)
    }
  }

  if (!activeAccount) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Wallet className="w-16 h-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground">Connect Your Wallet</h2>
          <p className="text-muted-foreground">Please connect your wallet to manage your friends</p>
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
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Friends</h1>
          <p className="text-muted-foreground">Manage your contacts and connections</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsQrOpen(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
          >
            <QrCode size={20} />
            My QR Code
          </Button>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-primary hover:bg-primary-dark text-primary-foreground flex items-center gap-2"
            disabled={loading}
          >
            <Plus size={20} />
            Add Friend
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="glass rounded-xl p-4 border border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Friends List */}
      <FriendsList 
        searchQuery={searchQuery} 
        friends={friends} 
        loading={loading}
        onRemoveFriend={handleRemoveFriend}
        currentAddress={activeAccount.address}
      />

      {/* Modals */}
      <AddFriendModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={refreshFriends} />
      <QrCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} address={activeAccount.address} />
      
      {/* Wallet Connect Modal */}
      <WalletConnectModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  )
}
