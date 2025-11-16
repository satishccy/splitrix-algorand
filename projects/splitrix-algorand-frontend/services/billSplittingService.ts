"use client"

import { AlgorandTransactionService, BillSplitParams, TransactionResult } from './algorandTransactionService'

export interface BillSplitResult {
  success: boolean
  transactionIds: string[]
  dustAmount: number
  splitAmount: number
  error?: string
}

export interface BillParticipant {
  address: string
  name: string
  amount: number
  paid: boolean
}

export class BillSplittingService {
  private transactionService: AlgorandTransactionService

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.transactionService = new AlgorandTransactionService(network)
  }

  async splitBill(
    totalAmount: number,
    participants: BillParticipant[],
    payerAddress: string,
    signer: any,
    note?: string
  ): Promise<BillSplitResult> {
    try {
      // Calculate split amounts
      const participantAddresses = participants.map(p => p.address)
      const splitAmount = Math.floor(totalAmount / participants.length)
      const dustAmount = totalAmount - (splitAmount * participants.length)

      // Create bill split parameters
      const billParams: BillSplitParams = {
        totalAmount,
        participants: participantAddresses,
        payerAddress,
        note: note || `Bill split: ${participants.length} participants`
      }

      // Create transactions
      const transactions = await this.transactionService.createBillSplitTransactions(billParams)
      
      // Send transactions
      const results = await this.transactionService.sendMultipleTransactions(transactions, signer)
      
      // Extract successful transaction IDs
      const successfulTxs = results.filter(r => r.success)
      const transactionIds = successfulTxs.map(r => r.txId)

      return {
        success: transactionIds.length > 0,
        transactionIds,
        dustAmount,
        splitAmount,
        error: results.some(r => !r.success) ? 'Some transactions failed' : undefined
      }
    } catch (error) {
      console.error('Error splitting bill:', error)
      return {
        success: false,
        transactionIds: [],
        dustAmount: 0,
        splitAmount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async settleBill(
    billId: string,
    participants: BillParticipant[],
    signer: any
  ): Promise<BillSplitResult> {
    try {
      // This would typically involve reading the bill from your database
      // and creating settlement transactions
      console.log(`Settling bill ${billId} for ${participants.length} participants`)
      
      // For now, return a mock result
      return {
        success: true,
        transactionIds: [`settlement_${billId}`],
        dustAmount: 0,
        splitAmount: 0
      }
    } catch (error) {
      console.error('Error settling bill:', error)
      return {
        success: false,
        transactionIds: [],
        dustAmount: 0,
        splitAmount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getAccountBalance(address: string): Promise<number> {
    try {
      return await this.transactionService.getAccountBalance(address)
    } catch (error) {
      console.error('Error fetching balance:', error)
      return 0
    }
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      // Basic Algorand address validation
      return address.length === 58 && address.startsWith('A')
    } catch (error) {
      return false
    }
  }

  formatAmount(amount: number): string {
    return `${amount.toFixed(6)} ALGO`
  }

  calculateDust(totalAmount: number, participantCount: number): number {
    const splitAmount = Math.floor(totalAmount / participantCount)
    return totalAmount - (splitAmount * participantCount)
  }
}

