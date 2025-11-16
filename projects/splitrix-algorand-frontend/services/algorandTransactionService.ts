"use client"

// Mock algosdk for development - replace with real algosdk when ready
const algosdk = {
  Algodv2: class MockAlgodv2 {
    constructor() {}
    async getTransactionParams() {
      return { fee: 1000, firstRound: 1, lastRound: 1000, genesisID: 'testnet', genesisHash: 'mock' }
    }
    async accountInformation() {
      return { amount: 10000000 } // 10 ALGO in microAlgos
    }
    async sendRawTransaction() {
      return { txId: 'MOCK_TX_ID_' + Math.random().toString(36).substr(2, 9) }
    }
  },
  Indexer: class MockIndexer {
    constructor() {}
    async lookupTransactionByID() {
      return { transaction: { id: 'mock' } }
    }
  },
  makePaymentTxnWithSuggestedParams: (from: string, to: string, amount: number, closeRemainderTo: any, note: any, params: any) => {
    return {
      from: () => from,
      to: () => to,
      amount: () => amount,
      note: () => note,
      params: () => params
    }
  },
  waitForConfirmation: async (client: any, txId: string, rounds: number) => {
    console.log(`Mock waiting for confirmation of ${txId}`)
    return { 'confirmed-round': 1 }
  }
}

export interface TransactionResult {
  txId: string
  success: boolean
  error?: string
}

export interface BillSplitParams {
  totalAmount: number
  participants: string[]
  payerAddress: string
  note?: string
}

export class AlgorandTransactionService {
  private client: algosdk.Algodv2
  private indexer: algosdk.Indexer
  private network: 'testnet' | 'mainnet'

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network
    
    // Configure Algorand client
    const algodToken = ''
    const algodServer = network === 'testnet' 
      ? 'https://testnet-api.algonode.cloud'
      : 'https://mainnet-api.algonode.cloud'
    const algodPort = ''

    this.client = new algosdk.Algodv2(algodToken, algodServer, algodPort)
    
    // Configure Indexer
    const indexerToken = ''
    const indexerServer = network === 'testnet'
      ? 'https://testnet-idx.algonode.cloud'
      : 'https://mainnet-idx.algonode.cloud'
    const indexerPort = ''

    this.indexer = new algosdk.Indexer(indexerToken, indexerServer, indexerPort)
  }

  async getAccountInfo(address: string) {
    try {
      const accountInfo = await this.client.accountInformation(address).do()
      return accountInfo
    } catch (error) {
      console.error('Error fetching account info:', error)
      throw error
    }
  }

  async getAccountBalance(address: string): Promise<number> {
    try {
      const accountInfo = await this.getAccountInfo(address)
      return accountInfo.amount / 1000000 // Convert from microAlgos to Algos
    } catch (error) {
      console.error('Error fetching balance:', error)
      return 0
    }
  }

  async createPaymentTransaction(
    from: string,
    to: string,
    amount: number,
    note?: string
  ): Promise<algosdk.Transaction> {
    try {
      const params = await this.client.getTransactionParams().do()
      
      const transaction = algosdk.makePaymentTxnWithSuggestedParams(
        from,
        to,
        Math.round(amount * 1000000), // Convert to microAlgos
        undefined,
        note ? new Uint8Array(Buffer.from(note)) : undefined,
        params
      )

      return transaction
    } catch (error) {
      console.error('Error creating payment transaction:', error)
      throw error
    }
  }

  async createBillSplitTransactions(params: BillSplitParams): Promise<algosdk.Transaction[]> {
    const { totalAmount, participants, payerAddress, note } = params
    const splitAmount = Math.floor(totalAmount / participants.length)
    const dustAmount = totalAmount - (splitAmount * participants.length)
    
    const transactions: algosdk.Transaction[] = []
    
    try {
      // Create payment transactions for each participant
      for (const participant of participants) {
        if (participant !== payerAddress && splitAmount > 0) {
          const transaction = await this.createPaymentTransaction(
            payerAddress,
            participant,
            splitAmount,
            note || 'Bill split payment'
          )
          transactions.push(transaction)
        }
      }

      // Handle dust (if any) - send to a dust pool address
      if (dustAmount > 0) {
        // For now, we'll send dust to the first participant
        // In a real implementation, you'd have a dedicated dust pool address
        const dustTransaction = await this.createPaymentTransaction(
          payerAddress,
          participants[0], // Temporary: send dust to first participant
          dustAmount,
          'Dust contribution to pool'
        )
        transactions.push(dustTransaction)
      }

      return transactions
    } catch (error) {
      console.error('Error creating bill split transactions:', error)
      throw error
    }
  }

  async sendTransaction(transaction: algosdk.Transaction, signer: any): Promise<TransactionResult> {
    try {
      const signedTxn = await signer(transaction)
      const { txId } = await this.client.sendRawTransaction(signedTxn).do()
      
      // Wait for confirmation
      const confirmedTxn = await algosdk.waitForConfirmation(
        this.client,
        txId,
        4 // Wait for 4 rounds
      )

      return {
        txId,
        success: true
      }
    } catch (error) {
      console.error('Error sending transaction:', error)
      return {
        txId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async sendMultipleTransactions(
    transactions: algosdk.Transaction[], 
    signer: any
  ): Promise<TransactionResult[]> {
    const results: TransactionResult[] = []
    
    for (const transaction of transactions) {
      const result = await this.sendTransaction(transaction, signer)
      results.push(result)
      
      // Add small delay between transactions
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    return results
  }

  async getTransactionStatus(txId: string): Promise<any> {
    try {
      const transaction = await this.indexer.lookupTransactionByID(txId).do()
      return transaction
    } catch (error) {
      console.error('Error fetching transaction status:', error)
      throw error
    }
  }

  // Utility method to format Algorand addresses
  formatAddress(address: string): string {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Utility method to convert Algos to microAlgos
  algosToMicroAlgos(algos: number): number {
    return Math.round(algos * 1000000)
  }

  // Utility method to convert microAlgos to Algos
  microAlgosToAlgos(microAlgos: number): number {
    return microAlgos / 1000000
  }
}
