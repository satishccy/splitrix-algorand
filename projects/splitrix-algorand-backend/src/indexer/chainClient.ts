import algosdk from "algosdk";
import { appConfig } from "../config";

export class ChainClient {
  private algodClient: algosdk.Algodv2;

  constructor() {
    this.algodClient = new algosdk.Algodv2(appConfig.algorand.algodToken, appConfig.algorand.algodUrl, appConfig.algorand.algodPort);
  }

  /**
   * Get the latest block round
   */
  async getLatestBlock(): Promise<number> {
    const status = await this.algodClient.status().do();
    return Number(status.lastRound);
  }

  /**
   * Get block by round number
   */
  async getBlock(round: number): Promise<algosdk.Block> {
    const block = await this.algodClient.block(round).do();
    return block.block;
  }

  /**
   * Get group data from box storage
   */
  async getGroupData(groupId: bigint): Promise<{
    admin: string;
    billCounter: bigint;
    members: string[];
  } | null> {
    try {
      // Group data is stored in boxes with key prefix "groups"
      // Box key format: "groups" + UInt64(groupId)
      const groupKeyPrefix = Buffer.from("groups");
      const groupIdBytes = algosdk.encodeUint64(groupId);
      const boxKey = Buffer.concat([groupKeyPrefix, groupIdBytes]);

      const box = await this.algodClient.getApplicationBoxByName(appConfig.algorand.contractAppId, boxKey).do();
      if (!box) {
        return null;
      }
      const groupType = algosdk.ABIType.from("(address,uint64,address[])");
      const group = groupType.decode(box.value) as [string, bigint, string[]];
      return { admin: group[0], billCounter: group[1], members: group[2] };
    } catch (error) {
      console.error(`Error fetching group data for groupId ${groupId}:`, error);
      return null;
    }
  }

  /**
   * Get bill data from box storage
   */
  async getBillData(
    groupId: bigint,
    billId: bigint
  ): Promise<{
    payer: string;
    totalAmount: bigint;
    debtors: Array<{
      debtor: string;
      amount: bigint;
      paid: bigint;
    }>;
    memo: string;
  } | null> {
    try {
      // Bill data is stored in boxes with key prefix "bills"
      // Box key format: "bills" + BillKey(groupId, billId)
      const billKeyPrefix = Buffer.from("bills");
      const groupIdBytes = algosdk.encodeUint64(groupId);
      const billIdBytes = algosdk.encodeUint64(billId);
      const boxKey = Buffer.concat([billKeyPrefix, groupIdBytes, billIdBytes]);

      const billType = algosdk.ABIType.from("(address,uint64,(address,uint64,uint64)[],string)");
      const box = await this.algodClient.getApplicationBoxByName(appConfig.algorand.contractAppId, boxKey).do();
      if (!box) {
        return null;
      }
      const bill = billType.decode(box.value) as [string, bigint, [string, bigint, bigint][], string];
      const debtors = bill[2].map((d) => ({ debtor: d[0], amount: d[1], paid: d[2] }));
      return { payer: bill[0], totalAmount: bill[1], debtors, memo: bill[3] };
    } catch (error) {
      console.error(`Error fetching bill data for groupId ${groupId}, billId ${billId}:`, error);
      return null;
    }
  }
}
