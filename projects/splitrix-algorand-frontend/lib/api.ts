import { config } from './config'

const apiUrl = config.backendUrl

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || `API error: ${response.statusText}`)
  }

  return response.json()
}

// Groups API
export const groupsApi = {
  getAll: (address?: string) => 
    fetchApi<any[]>(`/groups${address ? `?address=${address}` : ''}`),
  
  getById: (groupId: string) => 
    fetchApi<any>(`/groups/${groupId}`),
  
  getBills: (groupId: string) => 
    fetchApi<any[]>(`/groups/${groupId}/bills`),
}

// Bills API
export const billsApi = {
  getById: (billId: string) => 
    fetchApi<any>(`/bills/${billId}`),
  
  getUserBills: (address: string) => 
    fetchApi<any[]>(`/bills/user/${address}`),
}

// Balances API
export const balancesApi = {
  getByAddress: (address: string) => 
    fetchApi<any>(`/balances/${address}`),
}

// Analytics API
export const analyticsApi = {
  getUserAnalytics: (address: string) => 
    fetchApi<any>(`/analytics/user/${address}`),
  
  getGroupAnalytics: (groupId: string) => 
    fetchApi<any>(`/analytics/group/${groupId}`),
}

export interface DebtorMinimal {
  debtor: string; // Algorand address
  amount: string; // BigInt as string
}

export interface PayerDebt {
  bill_id: string; // bill_id as string
  bill_payer: string; // Algorand address of the old bill's payer
  payer_index_in_bill_debtors: string; // Index in old bill's debtors array
  amount_to_cutoff: string; // Amount to net (BigInt as string)
  debtor_index_in_current_bill: string; // Index in new bill's debtors array
}

export interface CreateBillHelperData {
  group_id: string;
  payer: string;
  total_amount: string;
  debtors: DebtorMinimal[];
  memo: string;
  payers_debt: PayerDebt[];
}

// Helpers API
export const helpersApi = {
  createBillData: (data: {
    groupId: string
    payer: string
    debtors: Array<{ address: string; amount: string }>
    memo: string
  }) => 
    fetchApi<CreateBillHelperData>('/helpers/create-bill-data', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getPendingDebts: (groupId: string, payer: string) => 
    fetchApi<any[]>(`/helpers/pending-debts/${groupId}/${payer}`),
  
  getGroupMembers: (groupId: string) => 
    fetchApi<string[]>(`/helpers/group-members/${groupId}`),
}

// Friends API
export const friendsApi = {
  addFriend: (data: { address: string; friendAddress: string; nickname?: string }) =>
    fetchApi<any>('/friends', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getFriends: (address: string) =>
    fetchApi<any[]>(`/friends/${address}`),
  
  removeFriend: (address: string, friendAddress: string) =>
    fetchApi<void>(`/friends/${address}/${friendAddress}`, {
      method: 'DELETE',
    }),
}

