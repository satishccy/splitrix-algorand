"use client"

import { WalletProvider, WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet-react'

const envNetwork = process.env.NEXT_PUBLIC_NETWORK as NetworkId || NetworkId.TESTNET;

const walletManager = new WalletManager({
  wallets: [WalletId.PERA, WalletId.LUTE, WalletId.DEFLY],
  defaultNetwork: envNetwork,
})

export function WalletProviderWrapper({ children }: { children: React.ReactNode }) {
  return <WalletProvider manager={walletManager}>{children}</WalletProvider>
}

