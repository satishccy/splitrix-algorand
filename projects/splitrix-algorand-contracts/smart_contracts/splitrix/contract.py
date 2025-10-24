from algopy import ARC4Contract, Account, BoxMap, Global, GlobalState, String, Txn, arc4, UInt64, subroutine, urange, gtxn

class Group(arc4.Struct):
    admin: arc4.Address
    bill_counter: arc4.UInt64
    members: arc4.DynamicArray[arc4.Address]

class Debtor(arc4.Struct):
    debtor: arc4.Address
    amount: arc4.UInt64
    paid: arc4.UInt64

class DebtorMinimal(arc4.Struct):
    debtor: arc4.Address
    amount: arc4.UInt64

class Bill(arc4.Struct):
    payer: arc4.Address
    total_amount: arc4.UInt64
    debtors: arc4.DynamicArray[Debtor]
    memo: arc4.String

class BillKey(arc4.Struct):
    group_id: arc4.UInt64
    bill_id: arc4.UInt64

class PayerDebt(arc4.Struct):
    bill_id: arc4.UInt64
    bill_payer: arc4.Address
    payer_index_in_bill_debtors: arc4.UInt64
    amount_to_cutoff: arc4.UInt64
    debtor_index_in_current_bill: arc4.UInt64

class GroupCreated(arc4.Struct):
    group_id: arc4.UInt64

class BillChanged(arc4.Struct):
    bill_key: BillKey

class Splitrix(ARC4Contract):

    def __init__(self) -> None:
        self.group_counter = GlobalState(UInt64,key="group_counter")
        self.group_counter.value = UInt64(0)
        self.groups = BoxMap(UInt64,Group,key_prefix="groups")
        self.bills = BoxMap(BillKey,Bill,key_prefix="bills")

    @subroutine
    def check_member_exists(self, members: arc4.DynamicArray[arc4.Address], member: arc4.Address) -> bool:
        for m in members:
            if m == member:
                return True
        return False
        
    @arc4.abimethod()
    def create_group(self, admin: arc4.Address, members: arc4.DynamicArray[arc4.Address]) -> arc4.UInt64:
        group_id = self.group_counter.value
        self.group_counter.value = group_id + 1
        new_members = arc4.DynamicArray[arc4.Address](admin)
        for m in members:
            if(m.native != Global.zero_address and not self.check_member_exists(new_members.copy(),m)):
                new_members.append(m)
        assert new_members.length > 1, "At least two members must be provided"
        assert admin.native != Global.zero_address, "Admin must be provided"
        self.groups[group_id] = Group(admin=admin,bill_counter=arc4.UInt64(0),members=new_members.copy())
        arc4.emit(GroupCreated(group_id=arc4.UInt64(group_id)))
        return arc4.UInt64(group_id)

    @subroutine
    def check_debtor_exists(self, debtors: arc4.DynamicArray[Debtor], debtor: arc4.Address) -> bool:
        for i in urange(debtors.length):
            d = debtors[i].copy()
            if d.debtor == debtor:
                return True
        return False

    @arc4.abimethod()
    def create_bill(
        self,
        group_id: arc4.UInt64,
        payer: arc4.Address,
        total_amount: arc4.UInt64,
        debtors: arc4.DynamicArray[DebtorMinimal],
        memo: arc4.String,
        payers_debt: arc4.DynamicArray[PayerDebt]
    ) -> arc4.UInt64:
        # ---- Validations ----
        assert group_id.native in self.groups, "Group does not exist"
        assert payer.native != Global.zero_address, "Payer must be provided"
        assert total_amount > 0, "Total amount must be greater than 0"
        assert debtors.length > 0, "At least one debtor must be provided"
        assert memo.bytes.length > 0, "Memo must be provided"

        group = self.groups[group_id.native].copy()
        current_bill_id = group.bill_counter

        # ---- Build debtors list ----
        debtors_new = arc4.DynamicArray[Debtor]()
        for i in urange(debtors.length):
            d = debtors[i].copy()
            if d.debtor.native != Global.zero_address and not self.check_debtor_exists(debtors_new.copy(), d.debtor):
                if d.debtor != payer:
                    debtors_new.append(Debtor(debtor=d.debtor, amount=d.amount, paid=arc4.UInt64(0)))
                else:
                    # payer's own share is considered fully paid
                    debtors_new.append(Debtor(debtor=d.debtor, amount=d.amount, paid=d.amount))

        assert debtors_new.length > 0, "At least one valid debtor must be provided"

        # ---- Check total matches ----
        total_amount_calculated = UInt64(0)
        for i in urange(debtors_new.length):
            x = debtors_new[i].copy()
            total_amount_calculated = total_amount_calculated + x.amount.native
        assert total_amount_calculated == total_amount, "Total amount does not match the sum of the debtors' amounts"

        # ---- Save new bill ----
        new_bill_key = BillKey(group_id=group_id, bill_id=current_bill_id)
        self.bills[new_bill_key] = Bill(
            payer=payer,
            total_amount=total_amount,
            debtors=debtors_new.copy(),
            memo=memo
        )
        group.bill_counter = arc4.UInt64(current_bill_id.native + 1)
        self.groups[group_id.native] = group.copy()

        # ---- Reload new bill into memory for netting updates ----
        new_bill = self.bills[new_bill_key].copy()

        # ---- Apply netting ----
        for i in urange(payers_debt.length):
            pd = payers_debt[i].copy()

            # Validate and update old bill
            old_bill_key = BillKey(group_id=group_id, bill_id=pd.bill_id)
            assert old_bill_key in self.bills, "Referenced bill does not exist"
            old_bill = self.bills[old_bill_key].copy()
            assert old_bill.payer == pd.bill_payer, "Bill payer mismatch"
            assert pd.payer_index_in_bill_debtors.native < old_bill.debtors.length, "Invalid debtor index"

            old_debtor = old_bill.debtors[pd.payer_index_in_bill_debtors.native].copy()
            cutoff = pd.amount_to_cutoff.native
            assert cutoff <= (old_debtor.amount.native - old_debtor.paid.native), "Cutoff exceeds pending debt"

            # Mark cutoff as paid in old bill
            old_debtor.paid = arc4.UInt64(old_debtor.paid.native + cutoff)
            old_bill.debtors[pd.payer_index_in_bill_debtors.native] = old_debtor.copy()
            self.bills[old_bill_key] = old_bill.copy()
            arc4.emit(BillChanged(bill_key=old_bill_key))

            # Reflect cutoff in the new bill (payer must exist in new bill debtors)
            assert pd.debtor_index_in_current_bill.native < new_bill.debtors.length, "Invalid debtor index"
            nd = new_bill.debtors[pd.debtor_index_in_current_bill.native].copy()
            assert nd.debtor == pd.bill_payer, "New bill does not contain the payer from netting"
            assert nd.paid.native + cutoff <= nd.amount.native, "Cutoff exceeds new bill obligation"
            nd.paid = arc4.UInt64(nd.paid.native + cutoff)
            new_bill.debtors[pd.debtor_index_in_current_bill.native] = nd.copy()

        # ---- Save the updated new bill ----
        self.bills[new_bill_key] = new_bill.copy()

        arc4.emit(BillChanged(bill_key=new_bill_key))
        return current_bill_id

    
    @arc4.abimethod()
    def settle_bill(self, group_id: arc4.UInt64, bill_id: arc4.UInt64, sender_index: arc4.UInt64, payment: gtxn.PaymentTransaction) -> None:
        bill_key = BillKey(group_id=group_id, bill_id=bill_id)
        assert bill_key in self.bills, "Bill does not exist"
        bill = self.bills[bill_key].copy()
        assert payment.receiver == bill.payer.native, "Payment must be sent to the payer"
        assert sender_index.native < bill.debtors.length, "Sender index is out of bounds"
        debtor = bill.debtors[sender_index.native].copy()
        assert debtor.debtor.native == payment.sender, "Sender is not a debtor for this bill"
        amount_to_pay = debtor.amount.native - debtor.paid.native

        assert amount_to_pay > 0, "Debt already paid"

        new_debtor = debtor.copy()
        amount_added = payment.amount
        if amount_added > amount_to_pay:
            amount_added = amount_to_pay
        
        new_debtor.paid = arc4.UInt64(debtor.paid.native + amount_added)
        bill.debtors[sender_index.native] = new_debtor.copy()
        self.bills[bill_key] = bill.copy()
       