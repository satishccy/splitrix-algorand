from src.db.settings import settings
from src.utils.main import algorand
from src.models import models
from src.utils.splitrix_client import SplitrixClient, BillKey

app_client = SplitrixClient(
    algorand=algorand,
    app_id=settings.APP_ID,
)


def get_group(group_id: int) -> models.Group:
    box_data = app_client.state.box.groups.get_value(group_id)
    if box_data:
        # Assuming members are returned as a list of addresses
        members = [models.Address(address=addr) for addr in box_data.members]
        return models.Group(
            id=group_id,
            admin=box_data.admin,
            bill_counter=box_data.bill_counter,
            members=members,
        )
    else:
        raise ValueError(f"Group with id {group_id} not found")


def get_bill(group_id: int, bill_id: int) -> models.Bill:
    box_data = app_client.state.box.bills.get_value(BillKey(group_id, bill_id))
    if box_data:
        debtors = [
            models.Debtor(debtor=d[0], amount=d[1], paid=d[2]) for d in box_data.debtors
        ]
        return models.Bill(
            id=bill_id,
            group_id=group_id,
            payer=box_data.payer,
            total_amount=box_data.total_amount,
            memo=box_data.memo,
            debtors=debtors,
        )
    else:
        raise ValueError(f"Bill with id {bill_id} not found")
