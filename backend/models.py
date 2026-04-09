from sqlalchemy import Column, Integer, String
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