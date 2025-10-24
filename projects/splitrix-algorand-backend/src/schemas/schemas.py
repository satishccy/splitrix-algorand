from pydantic import BaseModel
from typing import List


class Debtor(BaseModel):
    debtor: str
    amount: int
    paid: int

    class Config:
        orm_mode = True


class Bill(BaseModel):
    id: int
    group_id: int
    payer: str
    total_amount: int
    memo: str
    debtors: List[Debtor] = []

    class Config:
        orm_mode = True


class Address(BaseModel):
    address: str

    class Config:
        orm_mode = True


class Group(BaseModel):
    id: int
    admin: str
    bill_counter: int
    members: List[Address] = []
    bills: List[Bill] = []

    class Config:
        orm_mode = True
