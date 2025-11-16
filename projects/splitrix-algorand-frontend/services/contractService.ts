"use client";

import algosdk from "algosdk";
import { NetworkId, useWallet } from "@txnlab/use-wallet-react";
import { CreateBillHelperData, helpersApi } from "@/lib/api";
import { SplitrixClient, SplitrixFactory } from "@/contracts/Splitrix";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { config } from "@/lib/config";
// Dummy contract address - replace with actual deployed contract address

const getAlgorandClient = () => {
  if (config.network === NetworkId.TESTNET) {
    return AlgorandClient.testNet();
  } else if (config.network === NetworkId.MAINNET) {
    return AlgorandClient.mainNet();
  } else if (config.network === NetworkId.LOCALNET) {
    return AlgorandClient.defaultLocalNet();
  } else {
    throw new Error(`Unsupported network: ${config.network}`);
  }
};

const algorandClient = getAlgorandClient();

const splitrixFactory = new SplitrixFactory({ algorand: algorandClient });

const appClient = splitrixFactory.getAppClientById({
  appId: BigInt(config.contractId),
});

export interface CreateGroupParams {
  admin: string;
  members: string[];
}

export interface CreateBillParams {
  groupId: string;
  payer: string;
  debtors: Array<{ address: string; amount: string }>;
  memo: string;
}

export interface SettleBillParams {
  groupId: string;
  billId: string;
  senderIndex: number;
  amount: bigint;
  payerAddress: string;
}

export class ContractService {
  private transactionSigner: algosdk.TransactionSigner;
  private senderAddress: string;

  constructor(senderAddress: string, transactionSigner: algosdk.TransactionSigner) {
    this.senderAddress = senderAddress;
    this.transactionSigner = transactionSigner;
  }

  /**
   * Create a group transaction
   */
  async createGroup(params: CreateGroupParams): Promise<{ txId: string; groupId: bigint }> {
    if (!this.transactionSigner || !this.senderAddress) {
      throw new Error("Wallet not connected");
    }

    const txn = await appClient.send.createGroup({
      args: {
        admin: params.admin,
        members: params.members,
      },
      sender: this.senderAddress,
      signer: this.transactionSigner,
      populateAppCallResources: true,
    });

    return { txId: txn.txIds[0], groupId: txn.return ?? BigInt(0) };
  }

  /**
   * Create a bill transaction (dummy implementation)
   * First fetches helper data from API, then creates transaction
   */
  async createBill(helperData: CreateBillHelperData): Promise<{ txId: string; billId: bigint }> {
    if (!this.transactionSigner || !this.senderAddress) {
      throw new Error("Wallet not connected");
    }

    const debtors_args: [string, bigint][] = helperData.debtors.map((d) => [d.debtor, BigInt(d.amount)]);
    const payersDebt_args: [bigint, string, bigint, bigint, bigint][] = helperData.payers_debt.map((d) => [
      BigInt(d.bill_id),
      d.bill_payer,
      BigInt(d.payer_index_in_bill_debtors),
      BigInt(d.amount_to_cutoff),
      BigInt(d.debtor_index_in_current_bill),
    ]);

    const composer = appClient.newGroup().createBill({
      args: {
        groupId: BigInt(helperData.group_id),
        payer: helperData.payer,
        totalAmount: BigInt(helperData.total_amount),
        debtors: debtors_args,
        memo: helperData.memo,
        payersDebt: payersDebt_args,
      },
      sender: this.senderAddress,
      signer: algosdk.makeEmptyTransactionSigner(),
    });

    const result = await composer.simulate({
      allowEmptySignatures: true,
      fixSigners: true,
      allowMoreLogging: true,
      allowUnnamedResources: true,
      extraOpcodeBudget: 320000,
    });

    const opcodeConsumed = result.simulateResponse.txnGroups[0].appBudgetConsumed;

    if (!opcodeConsumed) {
      throw new Error("Failed to simulate create bill transaction");
    }

    const createBillGroup = appClient.newGroup().createBill({
      args: {
        groupId: BigInt(helperData.group_id),
        payer: helperData.payer,
        totalAmount: BigInt(helperData.total_amount),
        debtors: debtors_args,
        memo: helperData.memo,
        payersDebt: payersDebt_args,
      },
      sender: this.senderAddress,
      signer: this.transactionSigner,
    });

    const noTxnsToBeAdded = Math.ceil(opcodeConsumed / 700) - 1;

    for (let i = 0; i < noTxnsToBeAdded; i++) {
      createBillGroup.gas({ sender: this.senderAddress, signer: this.transactionSigner, args: [] });
    }

    const createBillResult = await createBillGroup.send({
      populateAppCallResources: true,
    });

    return { txId: createBillResult.txIds[0], billId: createBillResult.returns?.[0] ?? BigInt(0) };
  }

  /**
   * Settle a bill transaction
   */
  async settleBill(params: SettleBillParams): Promise<{ txId: string }> {
    if (!this.transactionSigner || !this.senderAddress) {
      throw new Error("Wallet not connected");
    }

    // Get suggested params from the client
    const suggestedParams = await algorandClient.client.algod.getTransactionParams().do();

    // Create a payment transaction to the bill payer
    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: this.senderAddress,
      receiver: params.payerAddress,
      amount: params.amount,
      suggestedParams,
    });

    // Call settle_bill with the payment transaction as part of an atomic group
    const txn = await appClient.send.settleBill({
      args: {
        groupId: BigInt(params.groupId),
        billId: BigInt(params.billId),
        senderIndex: BigInt(params.senderIndex),
        payment: paymentTxn,
      },
      sender: this.senderAddress,
      signer: this.transactionSigner,
      populateAppCallResources: true,
    });

    return { txId: txn.txIds[0] };
  }
}

// Hook to use contract service
export function useContractService() {
  const { activeAddress, transactionSigner } = useWallet();

  if (!transactionSigner || !activeAddress) {
    return null;
  }

  return new ContractService(activeAddress, transactionSigner);
}
