# Splitrix Algorand Smart Contracts

This directory contains the Splitrix smart contract, written in `puya-py` for the Algorand blockchain. The contract manages group creation, bill splitting, and debt settlement with automated netting capabilities.

This project was generated using AlgoKit.

---

## 🔐 Contract Deployment & Verification

**Deployed Contract Information:**

- **App ID:** `749724159`
- **Network:** Algorand TestNet
- **Contract Address:** `LGOX77WSBN32DR2FBDBOWVRKV545OKKJBJXDQNVSRVN4ZJZB4OPLSIGUNQ`
- **ABI:** [See ABI](smart_contracts/artifacts/splitrix/Splitrix.arc56.json)

**Verification Steps:**

1. Visit [Lora App Lab](https://lora.algokit.io/testnet/app-lab)
2. Create a new app interface using `Use Existing App` section using deployed App Id `749724159` and select [this abi](smart_contracts/artifacts/splitrix/Splitrix.arc56.json)
3. Open Below Transaction Links

Create Group Transaction Link:
[https://lora.algokit.io/testnet/transaction/M4VETIS5DYXRCFEFPM64P2VC5B3VIJVKRVT4CWJPQGGDHHP5QQPQ](https://lora.algokit.io/testnet/transaction/M4VETIS5DYXRCFEFPM64P2VC5B3VIJVKRVT4CWJPQGGDHHP5QQPQ)

Create Bill Transaction Link:
[https://lora.algokit.io/testnet/transaction/7ZJC3WVF465YWOY2AXAOFE4PYXYEKO64Y4FPA5BHEUSNXGKNEPDQ](https://lora.algokit.io/testnet/transaction/7ZJC3WVF465YWOY2AXAOFE4PYXYEKO64Y4FPA5BHEUSNXGKNEPDQ)

Settle Bill Transaction Link:
[https://lora.algokit.io/testnet/block/57561833/group/ClzEwFHJC4RwtbrkKQDll%2B2QD%2Fem6oq2Yl%2FaSp%2BopuQ%3D](https://lora.algokit.io/testnet/block/57561833/group/ClzEwFHJC4RwtbrkKQDll%2B2QD%2Fem6oq2Yl%2FaSp%2BopuQ%3D)

---

## 📜 ABI Methods & Events

### Structs

| Struct          | Fields                                                                                                                                              | Description                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `Group`         | `admin: Address`, `bill_counter: UInt64`, `members: Address[]`                                                                                      | Represents a group of members who can split bills.                           |
| `Debtor`        | `debtor: Address`, `amount: UInt64`, `paid: UInt64`                                                                                                 | Represents a debtor in a bill, including the amount paid.                    |
| `DebtorMinimal` | `debtor: Address`, `amount: UInt64`                                                                                                                 | A minimal representation of a debtor used for creating bills.                |
| `Bill`          | `payer: Address`, `total_amount: UInt64`, `debtors: Debtor[]`, `memo: String`                                                                       | Represents a bill, including the payer, total amount, and list of debtors.   |
| `BillKey`       | `group_id: UInt64`, `bill_id: UInt64`                                                                                                               | A unique key to identify a bill within a group.                              |
| `PayerDebt`     | `bill_id: UInt64`, `bill_payer: Address`, `payer_index_in_bill_debtors: UInt64`, `amount_to_cutoff: UInt64`, `debtor_index_in_current_bill: UInt64` | Used for netting to specify a previous debt to be offset against a new bill. |

### ABI Methods

| Method         | Inputs                                                                                                                               | Outputs                  | Description                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ---------------------------------------------------------------- |
| `create_group` | `admin: Address`, `members: Address[]`                                                                                               | `group_id: UInt64`       | Creates a new expense group.                                     |
| `create_bill`  | `group_id: UInt64`, `payer: Address`, `total_amount: UInt64`, `debtors: DebtorMinimal[]`, `memo: String`, `payers_debt: PayerDebt[]` | `bill_id: UInt64`        | Creates a bill with advanced netting.                            |
| `settle_bill`  | `group_id: UInt64`, `bill_id: UInt64`, `sender_index: UInt64`, `payment: PaymentTransaction`                                         | `None`                   | Settles a specific debt in a bill via a payment transaction.     |
| `get_group`    | `group_id: UInt64`                                                                                                                   | `None` (logs group data) | Retrieves and logs group details. Readonly.                      |
| `get_bill`     | `bill_key: BillKey`                                                                                                                  | `None` (logs bill data)  | Retrieves and logs bill details. Readonly.                       |
| `get_groups`   | `group_ids: UInt64[]`                                                                                                                | `None` (logs group data) | Retrieves and logs details for multiple groups. Readonly.        |
| `get_bills`    | `bill_keys: BillKey[]`                                                                                                               | `None` (logs bill data)  | Retrieves and logs details for multiple bills. Readonly.         |
| `gas`          | -                                                                                                                                    | -                        | Empty method to increase opcode budget for complex transactions. |

### ARC-28 Events

| Event          | Payload             | Description                                                                               |
| -------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `GroupCreated` | `group_id: UInt64`  | Emitted when a new group is created.                                                      |
| `BillChanged`  | `bill_key: BillKey` | Emitted when a bill is created or its state is updated (e.g., via netting or settlement). |

---

## 🛠️ Development Setup

### Pre-requisites

- [Python 3.12](https://www.python.org/downloads/) or later
- [Docker](https://www.docker.com/)
- [AlgoKit CLI](https://github.com/algorandfoundation/algokit-cli#install)

### Installation and Deployment

1. **Bootstrap Environment**

   ```bash
   algokit project bootstrap all
   ```

2. **Build Contracts**

   ```bash
   algokit project run build
   ```

3. **Deploy to LocalNet**
   ```bash
   algokit project deploy localnet
   # Note the App ID from output and update .env files in other projects
   ```

---

## 🔧 Tools

This project uses the following tools:

- [Algorand](https://www.algorand.com/)
- [AlgoKit](https://github.com/algorandfoundation/algokit-cli)
- [Algorand Python (puya-py)](https://github.com/algorandfoundation/puya)
- [AlgoKit Utils](https://github.com/algorandfoundation/algokit-utils-py)
- [Poetry](https://python-poetry.org/)
