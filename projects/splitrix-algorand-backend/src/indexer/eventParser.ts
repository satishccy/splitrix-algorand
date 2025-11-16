import algosdk from "algosdk";
import { splitrixAbi } from "../contract";
import { sha512_256 } from "js-sha512";
/**
 * ARC4 event signatures
 * Events are emitted as logs with format: "ARC4Event" + base64(encoded_struct)
 */
export interface GroupCreatedEvent {
  type: "GroupCreated";
  groupId: bigint;
}

export interface BillChangedEvent {
  type: "BillChanged";
  billKey: {
    groupId: bigint;
    billId: bigint;
  };
}

export type ParsedEvent = GroupCreatedEvent | BillChangedEvent;

const getEventSelector = (eventSignature: string) => {
  const hashHex = sha512_256(eventSignature);
  return hashHex.slice(0, 8);
};

/**
 * Parse ARC4 events from transaction logs
 */
export class EventParser {
  private readonly groupCreatedSelector = getEventSelector("GroupCreated(uint64)");
  private readonly billChangedSelector = getEventSelector("BillChanged((uint64,uint64))");

  /**
   * Parse events from transaction logs
   */
  parseEvents(logs: Uint8Array[]): ParsedEvent[] {
    const events: ParsedEvent[] = [];

    for (const log of logs) {
      const logBuffer = Buffer.from(log);
      const selector = logBuffer.subarray(0, 4).toString("hex");
      if (selector !== this.groupCreatedSelector && selector !== this.billChangedSelector) {
        continue;
      }

      try {
        const eventData = log.slice(4);
        const event = this.parseEventData(selector, eventData);
        if (event) {
          events.push(event);
        }
      } catch (error) {
        console.error("Error parsing event log:", error);
      }
    }

    return events;
  }

  /**
   * Parse event data buffer
   * ARC4 structs are encoded with type discriminator prefix
   */
  private parseEventData(selector: string, data: Uint8Array): ParsedEvent | null {
    if (data.length < 8) {
      return null;
    }

    const groupCreatedEventDataType = algosdk.ABIType.from("uint64");
    const billChangedEventDataType = algosdk.ABIType.from("(uint64,uint64)");

    try {
      if (selector === this.groupCreatedSelector) {
        const groupId = groupCreatedEventDataType.decode(data) as bigint;
        return {
          type: "GroupCreated",
          groupId: groupId,
        };
      } else if (selector === this.billChangedSelector) {
        const billKey = billChangedEventDataType.decode(data) as [bigint, bigint];
        return {
          type: "BillChanged",
          billKey: {
            groupId: billKey[0],
            billId: billKey[1],
          },
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error parsing event data:", error);
      return null;
    }
  }
}
