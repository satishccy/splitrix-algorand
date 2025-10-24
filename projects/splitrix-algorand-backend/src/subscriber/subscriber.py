import json
from algokit_subscriber import AlgorandSubscriber, SubscribedTransaction
from algokit_subscriber import AlgorandSubscriberConfig
from algokit_subscriber.subscription import TransactionFilter
from algokit_subscriber.types.arc28 import Arc28Event, Arc28EventGroup, Arc28EventArg
from algokit_subscriber.types.subscription import (
    SubscriberConfigFilter,
    WatermarkPersistence,
)
from algosdk.v2client import indexer, algod
from src.db.database import SessionLocal
from src.models import models
from algosdk.abi import Contract
from algosdk import encoding
from src.db.settings import settings
from src.utils.main import algorand
from src.utils.box import get_group, get_bill


arc28_events = Arc28EventGroup(
    group_name="Splitrix",
    process_for_app_ids=[settings.APP_ID],
    events=[
        Arc28Event(
            name="GroupCreated", args=[Arc28EventArg(name="group_id", type="uint64")]
        ),
        Arc28Event(
            name="BillChanged",
            args=[Arc28EventArg(name="bill_key", type="(uint64,uint64)")],
        ),
    ],
)


def get_or_create_address(db: SessionLocal, address: str):
    db_address = (
        db.query(models.Address).filter(models.Address.address == address).first()
    )
    if not db_address:
        db_address = models.Address(address=address)
        db.add(db_address)
        db.commit()
        db.refresh(db_address)
    return db_address


def process_splitrix_event(
    event: SubscribedTransaction, algod_client: algod.AlgodClient, db: SessionLocal
):
    arc28_events = event.get("arc28_events")
    if arc28_events:
        for arc28_event in arc28_events:
            event_name = arc28_event.get("event_name")
            event_args = arc28_event.get("args")
            if event_name and event_args:
                if event_name == "GroupCreated":
                    group_id = event_args[0]
                    new_group_data = get_group(group_id)
                    print(f"GroupCreated: group_id: {group_id}")

                    # Upsert Group and Addresses
                    with db() as session:
                        # Ensure admin exists
                        admin_address = get_or_create_address(session, new_group_data.admin)

                        # Ensure members exist
                        member_addresses = []
                        for member in new_group_data.members:
                            member_addr = (
                                member.address
                                if isinstance(member, models.Address)
                                else str(member)
                            )
                            member_addresses.append(
                                get_or_create_address(session, member_addr)
                            )

                        # Upsert group
                        db_group = (
                            session.query(models.Group)
                            .filter(models.Group.id == group_id)
                            .first()
                        )
                        if not db_group:
                            # Create group first, then attach members to avoid FK issues
                            db_group = models.Group(
                                id=group_id,
                                admin=admin_address.address,
                                bill_counter=new_group_data.bill_counter,
                            )
                            session.add(db_group)
                            session.flush()
                            db_group.members = member_addresses
                        else:
                            db_group.admin = admin_address.address
                            db_group.bill_counter = new_group_data.bill_counter
                            db_group.members = member_addresses
                            session.add(db_group)
                        session.commit()

                if event_name == "BillChanged":
                    bill_key = event_args[0]
                    group_id, bill_id = bill_key
                    print(f"BillChanged: group_id: {group_id}, bill_id: {bill_id}")
                    new_bill_data = get_bill(group_id, bill_id)

                    # Upsert Bill, Debtors, and related Addresses
                    with db() as session:
                        # Ensure group exists (may not have processed GroupCreated yet)
                        db_group = (
                            session.query(models.Group)
                            .filter(models.Group.id == group_id)
                            .first()
                        )
                        if not db_group:
                            try:
                                grp = get_group(group_id)
                                admin_address = get_or_create_address(session, grp.admin)
                                member_addresses = []
                                for member in grp.members:
                                    member_addr = (
                                        member.address
                                        if isinstance(member, models.Address)
                                        else str(member)
                                    )
                                    member_addresses.append(
                                        get_or_create_address(session, member_addr)
                                    )
                                # Create group first, then set members to avoid FK issues
                                db_group = models.Group(
                                    id=group_id,
                                    admin=admin_address.address,
                                    bill_counter=grp.bill_counter,
                                )
                                session.add(db_group)
                                session.flush()
                                db_group.members = member_addresses
                                session.commit()
                            except Exception:
                                # If group box is not accessible for some reason, skip group insert
                                pass

                        # Ensure payer exists in addresses for consistency
                        get_or_create_address(session, new_bill_data.payer)

                        # Upsert bill record
                        db_bill = (
                            session.query(models.Bill)
                            .filter(
                                models.Bill.id == bill_id,
                                models.Bill.group_id == group_id,
                            )
                            .first()
                        )
                        if not db_bill:
                            db_bill = models.Bill(id=bill_id, group_id=group_id)

                        db_bill.payer = new_bill_data.payer
                        db_bill.total_amount = new_bill_data.total_amount
                        db_bill.memo = new_bill_data.memo

                        # Replace debtors with latest state
                        # Clear existing
                        if db_bill.debtors:
                            for debtor in list(db_bill.debtors):
                                session.delete(debtor)
                            session.flush()

                        # Recreate debtors
                        new_debtors = []
                        for d in new_bill_data.debtors:
                            debtor_addr = (
                                d.debtor if isinstance(d, models.Debtor) else d[0]
                            )
                            amount_val = d.amount if isinstance(d, models.Debtor) else d[1]
                            paid_val = d.paid if isinstance(d, models.Debtor) else d[2]

                            get_or_create_address(session, debtor_addr)
                            new_debtors.append(
                                models.Debtor(
                                    debtor=debtor_addr,
                                    amount=amount_val,
                                    paid=paid_val,
                                    bill=db_bill,
                                )
                            )

                        db_bill.debtors = new_debtors
                        session.add(db_bill)
                        session.commit()

#     else:
#         return
#     group_id = arc28_event[0]["args"][0]
#     group_id = event["args"][0]
#     box_content = algod_client.application_box_by_name(
#         YOUR_APP_ID, encoding.decode_address("groups") + group_id.to_bytes(8, "big")
#     )
#     group_data = contract.get_struct_type("Group").decode(box_content["value"])

#     with db() as session:
#         admin_address = get_or_create_address(session, group_data["admin"])

#         member_addresses = []
#         for member_addr in group_data["members"]:
#             member_addresses.append(get_or_create_address(session, member_addr))

#         new_group = models.Group(
#             id=group_id,
#             admin=admin_address.address,
#             bill_counter=group_data["bill_counter"],
#             members=member_addresses,
#         )
#         session.add(new_group)
#         session.commit()


# def process_bill_changed(event, algod_client: algod.AlgodClient, db: SessionLocal):
#     bill_key = event["args"][0]
#     group_id, bill_id = bill_key

#     box_name_encoded = (
#         encoding.decode_address("bills")
#         + group_id.to_bytes(8, "big")
#         + bill_id.to_bytes(8, "big")
#     )
#     box_content = algod_client.application_box_by_name(YOUR_APP_ID, box_name_encoded)
#     bill_data = contract.get_struct_type("Bill").decode(box_content["value"])

#     with db() as session:
#         db_bill = (
#             session.query(models.Bill)
#             .filter(models.Bill.id == bill_id, models.Bill.group_id == group_id)
#             .first()
#         )
#         if not db_bill:
#             db_bill = models.Bill(id=bill_id, group_id=group_id)

#         db_bill.payer = bill_data["payer"]
#         db_bill.total_amount = bill_data["total_amount"]
#         db_bill.memo = bill_data["memo"]

#         # Clear existing debtors to replace them with the new list
#         for debtor in db_bill.debtors:
#             session.delete(debtor)
#         session.commit()

#         new_debtors = []
#         for d in bill_data["debtors"]:
#             debtor_address = get_or_create_address(session, d["debtor"])
#             new_debtor = models.Debtor(
#                 debtor=debtor_address.address,
#                 amount=d["amount"],
#                 paid=d["paid"],
#                 bill=db_bill,
#             )
#             new_debtors.append(new_debtor)

#         db_bill.debtors = new_debtors
#         session.add(db_bill)
#         session.commit()


def start_subscriber():

    db_session_local = SessionLocal

    watermark = 0

    # To implement a watermark in the subscriber, we must define a get and set function
    def get_watermark() -> int:
        """
        Get the current watermark value
        """
        return watermark

    def set_watermark(new_watermark: int) -> None:
        """
        Set our watermark variable to the new watermark from the subscriber
        """
        global watermark  # noqa: PLW0603
        watermark = new_watermark

    subscriber = AlgorandSubscriber(
        config=AlgorandSubscriberConfig(
            filters=[
                SubscriberConfigFilter(
                    name="Splitrix",
                    filter=TransactionFilter(
                        arc28_events=[
                            {"group_name": "Splitrix", "event_name": "GroupCreated"},
                            {"group_name": "Splitrix", "event_name": "BillChanged"},
                        ]
                    ),
                )
            ],
            arc28_events=[arc28_events],
            sync_behaviour="skip-sync-newest",
            watermark_persistence=WatermarkPersistence(
                get=get_watermark,
                set=set_watermark,
            ),
        ),
        algod_client=algorand.client.algod,
    )

    def listerner(txn: SubscribedTransaction, name: str):
        print(f"Listerner: {name}")
        process_splitrix_event(txn, algorand.client.algod, db_session_local)

    subscriber.on("Splitrix", listerner)

    subscriber.start()


if __name__ == "__main__":
    start_subscriber()
