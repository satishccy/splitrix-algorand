import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from algosdk.atomic_transaction_composer import TransactionWithSigner
from src.utils.main import algorand
from src.db.settings import settings
from algokit_utils import (
    CommonAppCallParams,
    SendParams,
    SigningAccount,
    AlgoAmount,
    PaymentParams,
)
from typing import List, Tuple
from src.utils.splitrix_client import (
    CreateBillArgs,
    SplitrixClient,
    CreateGroupArgs,
    SettleBillArgs,
)
from src.utils.box import get_group, get_bill

deployer = algorand.account.dispenser_from_environment()
app_client = SplitrixClient(
    algorand=algorand,
    app_id=settings.APP_ID,
)

print(f"address: {deployer.address}")


def get_funded_address():
    account = algorand.account.random()
    algorand.send.payment(
        PaymentParams(
            amount=AlgoAmount(algo=100),
            sender=deployer.address,
            receiver=account.address,
        )
    )
    return account


def create_group(admin: SigningAccount, members: List[SigningAccount]):
    members = [member.address for member in members]
    res = app_client.send.create_group(
        args=CreateGroupArgs(admin=admin.address, members=members),
        params=CommonAppCallParams(sender=admin.address, signer=admin.signer),
        send_params=SendParams(populate_app_call_resources=True),
    )
    return res.abi_return


def create_bill(
    group_id: int,
    payer: SigningAccount,
    debtors: List[Tuple[str, int]],
    memo: str,
):
    total_amount = sum(amount for _, amount in debtors)
    res = app_client.send.create_bill(
        args=CreateBillArgs(
            group_id=group_id,
            payer=payer.address,
            total_amount=total_amount,
            debtors=debtors,
            memo=memo,
            payers_debt=[],
        ),
        params=CommonAppCallParams(sender=payer.address, signer=payer.signer),
        send_params=SendParams(populate_app_call_resources=True),
    )
    return res.abi_return


def settle_bill(
    group_id: int,
    bill_id: int,
    payer_index: int,
    payer: SigningAccount,
    amount: int,
    receiver: str,
):
    print(
        f"settle_bill: group_id: {group_id}, bill_id: {bill_id}, payer_index: {payer_index}, payer: {payer.address}, amount: {amount}, receiver: {receiver}"
    )
    res = app_client.send.settle_bill(
        args=SettleBillArgs(
            group_id=group_id,
            bill_id=bill_id,
            sender_index=payer_index,
            payment=TransactionWithSigner(
                txn=algorand.create_transaction.payment(
                    PaymentParams(
                        sender=payer.address,
                        receiver=receiver,
                        amount=AlgoAmount.from_algo(amount),
                    ),
                ),
                signer=payer.signer,
            ),
        ),
        params=CommonAppCallParams(sender=payer.address, signer=payer.signer),
        send_params=SendParams(populate_app_call_resources=True),
    )
    return True


if __name__ == "__main__":
    satish = get_funded_address()
    sai = get_funded_address()
    sandeep = get_funded_address()

    print(
        f"created addresses: satish: {satish.address}\nsai: {sai.address}\nsandeep: {sandeep.address}"
    )

    group_id = create_group(satish, [sai, sandeep])

    group = get_group(group_id)
    print(f"Group: {group}")

    if group_id is None:
        print("Failed to create group")
        exit(1)

    print(f"Group created with id: {group_id}")

    bill_id = create_bill(
        group_id,
        satish,
        [
            (sai.address, AlgoAmount.from_algo(1).micro_algo),
            (sandeep.address, AlgoAmount.from_algo(2).micro_algo),
        ],
        "Test bill",
    )

    if bill_id is None:
        print("Failed to create bill")
        exit(1)

    print(f"Bill created with id: {bill_id}")

    bill = get_bill(group_id, bill_id)
    print(f"Bill: {bill}")

    settle_bill(group_id, bill_id, 0, sai, 1, satish.address)

    bill = get_bill(group_id, bill_id)
    print(f"Bill after sai settling: {bill}")

    settle_bill(group_id, bill_id, 1, sandeep, 2, satish.address)

    bill = get_bill(group_id, bill_id)
    print(f"Bill after sandeep settling: {bill}")
