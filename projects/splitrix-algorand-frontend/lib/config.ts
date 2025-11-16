import { NetworkId } from "@txnlab/use-wallet-react";

export const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000/api",
  network: (process.env.NEXT_PUBLIC_NETWORK as NetworkId) || NetworkId.TESTNET,
  contractId: parseInt(process.env.NEXT_PUBLIC_APP_ID || "0", 10),
} as const;
