"use client"

import { useState, useEffect } from 'react'

export interface WalletState {
  activeAddress: string | null
  isActive: boolean
  isConnecting: boolean
  balance: number
  network: 'testnet' | 'mainnet'
}

export function useAlgorandWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    activeAddress: null,
    isActive: false,
    isConnecting: false,
    balance: 0,
    network: 'testnet'
  })

  // Mock wallet connection for development
  const connectWallet = async (provider: 'pera' | 'defly' | 'exodus' = 'pera') => {
    try {
      setWalletState(prev => ({ ...prev, isConnecting: true }))
      
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock wallet address for testing
      const mockAddress = "ALGORAND_TESTNET_ADDRESS_1234567890ABCDEF"
      
      setWalletState(prev => ({
        ...prev,
        activeAddress: mockAddress,
        isActive: true,
        isConnecting: false,
        balance: 10.5 // Mock balance
      }))
      
      console.log(`Mock ${provider} wallet connected:`, mockAddress)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setWalletState(prev => ({ ...prev, isConnecting: false }))
      throw error
    }
  }

  const disconnectWallet = async () => {
    try {
      setWalletState(prev => ({ ...prev, isConnecting: true }))
      
      // Simulate disconnection delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setWalletState({
        activeAddress: null,
        isActive: false,
        isConnecting: false,
        balance: 0,
        network: 'testnet'
      })
      
      console.log('Mock wallet disconnected')
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      setWalletState(prev => ({ ...prev, isConnecting: false }))
      throw error
    }
  }

  const getShortAddress = (address: string | null) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getWalletProvider = () => {
    return walletState.isActive ? 'Mock Wallet (Development)' : 'Not Connected'
  }

  // Mock signer function for development
  const signer = async (transaction: any) => {
    console.log('Mock signing transaction:', transaction)
    // In a real implementation, this would sign the transaction
    return transaction
  }

  // Mock providers for development
  const providers = {
    pera: { isConnected: walletState.isActive },
    defly: { isConnected: false },
    exodus: { isConnected: false }
  }

  return {
    ...walletState,
    signer,
    providers,
    connectWallet,
    disconnectWallet,
    getShortAddress,
    getWalletProvider
  }
}
