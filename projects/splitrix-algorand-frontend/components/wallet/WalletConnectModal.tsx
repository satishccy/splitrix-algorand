"use client"

import { useWallet } from '@txnlab/use-wallet-react'
import React from 'react'

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
  const { wallets } = useWallet()

  const handleConnect = async (wallet: any) => {
    try {
      await wallet.connect()
      onClose()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="glass rounded-xl shadow-2xl border border-border p-6 w-full max-w-md transform transition-all" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <svg className="w-5 h-5 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground">Connect Wallet</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground transition-all rounded-lg p-1 hover:bg-surface-light"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Choose your preferred wallet provider to continue
        </p>
        
        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
          {wallets?.map((wallet: any) => (
            <button
              key={wallet.metadata.id}
              onClick={() => handleConnect(wallet)}
              className="w-full flex items-center px-4 py-3.5 border border-border rounded-lg hover:border-primary hover:bg-surface-light transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-light border border-border flex items-center justify-center mr-4 group-hover:bg-surface group-hover:border-primary/50 transition-all">
                <img
                  src={wallet.metadata.icon}
                  alt={wallet.metadata.name}
                  className="w-7 h-7"
                />
              </div>
              <span className="font-semibold text-base text-foreground group-hover:text-primary transition-all">
                {wallet.metadata.name}
              </span>
              <svg className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )) || (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-light border border-border mx-auto mb-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-foreground font-medium">No wallet providers available</p>
              <p className="text-sm text-muted-foreground mt-1">Please install a compatible wallet extension</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WalletConnectModal

