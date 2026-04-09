from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ================= DATABASE SETTINGS =================
DATABASE_URL = "sqlite:///./inventory.db"  # локальная SQLite база, файл создается автоматически

engine = create_engine(
	DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()