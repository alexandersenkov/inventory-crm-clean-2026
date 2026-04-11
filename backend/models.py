# backend/models.py
from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    inv_number = Column(String, nullable=True)
    serial_number = Column(String, nullable=True)
    MAC_address = Column(String, nullable=True)
    factory_number = Column(String, nullable=True)
    vendor = Column(String, nullable=True)
    model = Column(String, nullable=True)
    hostname = Column(String, nullable=True)
    street = Column(String, nullable=True)
    frame = Column(Integer, nullable=True)
    floor = Column(String, nullable=True)
    room = Column(String, nullable=True)
    status = Column(String, nullable=True)
    condition = Column(String, nullable=True)
    other = Column(String, nullable=True)
    Mol = Column(String, nullable=True)
    Mol_fio = Column(String, nullable=True)
    Inventory_dt = Column(Date, nullable=True)
    update_dt = Column(Date, nullable=True)

class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String, nullable=False)
    action = Column(String, nullable=False)
    equipment_id = Column(Integer, nullable=True)
    equipment_name = Column(String, nullable=True)
    changes = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String, nullable=True)