# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Подключение к PostgreSQL в Docker
# Если бэкенд запускается НЕ в контейнере, используем localhost
DATABASE_URL = "postgresql://admin:admin@localhost:5432/inventory"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()