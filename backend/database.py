
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# .env dosyasındaki değişkenleri yükle
load_dotenv()

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL")

# PostgreSQL bağlantısı
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

# Database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# SQLAlchemy Base
Base = declarative_base()


# Database session yönetimi
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
