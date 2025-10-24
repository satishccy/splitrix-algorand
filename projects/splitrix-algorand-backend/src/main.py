from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from .db.database import SessionLocal, engine
from .models import models
from .schemas import schemas

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/groups/", response_model=List[schemas.Group])
def read_groups(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    groups = db.query(models.Group).offset(skip).limit(limit).all()
    return groups


@app.get("/groups/{group_id}", response_model=schemas.Group)
def read_group(group_id: int, db: Session = Depends(get_db)):
    db_group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_group


@app.get("/groups/{group_id}/bills/", response_model=List[schemas.Bill])
def read_group_bills(group_id: int, db: Session = Depends(get_db)):
    db_group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_group.bills


@app.get("/groups/{group_id}/members/", response_model=List[schemas.Address])
def read_group_members(group_id: int, db: Session = Depends(get_db)):
    db_group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_group.members


@app.get("/addresses/{address}/groups/", response_model=List[schemas.Group])
def read_address_groups(address: str, db: Session = Depends(get_db)):
    db_address = (
        db.query(models.Address).filter(models.Address.address == address).first()
    )
    if db_address is None:
        raise HTTPException(status_code=404, detail="Address not found")
    return db_address.groups


@app.get("/groups/{group_id}/bills/{bill_id}", response_model=schemas.Bill)
def read_bill(group_id: int, bill_id: int, db: Session = Depends(get_db)):
    db_bill = (
        db.query(models.Bill)
        .filter(models.Bill.group_id == group_id, models.Bill.id == bill_id)
        .first()
    )
    if db_bill is None:
        raise HTTPException(status_code=404, detail="Bill not found")
    return db_bill
