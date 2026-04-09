from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from database import Base

# ================= USER MODEL =================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)

# ================= EQUIPMENT MODEL =================
class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    inv_num = Column(String, nullable=True)
    sn = Column(String, nullable=True)
    mac = Column(String, nullable=True)
    zav_num = Column(String, nullable=True)
    vendor = Column(String, nullable=True)
    model = Column(String, nullable=True)
    hostname = Column(String, nullable=True)
    street = Column(String, nullable=True)
    kor = Column(String, nullable=True)
    etaj = Column(String, nullable=True)
    kab = Column(String, nullable=True)
    status = Column(String, nullable=True)
    condition = Column(String, nullable=True)
    other = Column(String, nullable=True)

# ================= HISTORY MODEL (НОВАЯ) =================
class History(Base):
    __tablename__ = "history"
    
    id = Column(Integer, primary_key=True, index=True)
    user = Column(String, nullable=False)  # Кто сделал действие
    action = Column(String, nullable=False)  # CREATE, UPDATE, DELETE
    equipment_id = Column(Integer, nullable=True)  # ID оборудования
    equipment_name = Column(String, nullable=True)  # Название оборудования
    changes = Column(Text, nullable=True)  # JSON с изменениями (что было → что стало)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())  # Когда произошло
    ip_address = Column(String, nullable=True)  # IP адрес пользователя