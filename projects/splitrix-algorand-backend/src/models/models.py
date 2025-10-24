from sqlalchemy import Column, BigInteger, String, ForeignKey, Table, Integer
from sqlalchemy.orm import relationship
from ..db.database import Base

address_group_association = Table(
    "address_group_association",
    Base.metadata,
    Column("address_id", BigInteger, ForeignKey("addresses.id")),
    Column("group_id", BigInteger, ForeignKey("groups.id")),
)


class Group(Base):
    __tablename__ = "groups"
    id = Column(BigInteger, primary_key=True, index=True)
    admin = Column(String(58), nullable=False)
    bill_counter = Column(BigInteger, default=0)
    members = relationship(
        "Address", secondary=address_group_association, back_populates="groups"
    )
    bills = relationship("Bill", back_populates="group")

    def __repr__(self):
        return f"<Group(id={self.id}, admin='{self.admin}', bill_counter={self.bill_counter}, members={self.members}, bills={self.bills})>"


class Bill(Base):
    __tablename__ = "bills"
    id = Column(BigInteger, primary_key=True, index=True)
    group_id = Column(BigInteger, ForeignKey("groups.id"))
    payer = Column(String(58), nullable=False)
    total_amount = Column(BigInteger, nullable=False)
    memo = Column(String(255), nullable=False)

    group = relationship("Group", back_populates="bills")
    debtors = relationship("Debtor", back_populates="bill")

    def __repr__(self):
        return f"<Bill(id={self.id}, group_id={self.group_id}, payer='{self.payer}', total_amount={self.total_amount}, memo='{self.memo}', debtors={self.debtors})>"


class Debtor(Base):
    __tablename__ = "debtors"
    id = Column(BigInteger, primary_key=True, index=True)
    bill_id = Column(BigInteger, ForeignKey("bills.id"))
    debtor = Column(String(58), nullable=False)
    amount = Column(BigInteger, nullable=False)
    paid = Column(BigInteger, default=0)

    bill = relationship("Bill", back_populates="debtors")

    def __repr__(self):
        return f"<Debtor(id={self.id}, bill_id={self.bill_id}, debtor='{self.debtor}', amount={self.amount}, paid={self.paid})>"


class Address(Base):
    __tablename__ = "addresses"
    id = Column(BigInteger, primary_key=True, index=True)
    address = Column(String(58), unique=True, index=True)
    groups = relationship(
        "Group", secondary=address_group_association, back_populates="members"
    )

    def __repr__(self):
        return f"<Address(id={self.id}, address='{self.address}')>"
