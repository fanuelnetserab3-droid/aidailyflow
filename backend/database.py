import os
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Railway tillhandahåller DATABASE_URL automatiskt (PostgreSQL)
# Lokalt faller vi tillbaka till SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "")

if DATABASE_URL.startswith("postgres://"):
    # Railway använder postgres:// men SQLAlchemy kräver postgresql://
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

_json_ser = lambda obj: json.dumps(obj, ensure_ascii=False)

if DATABASE_URL and "postgresql" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        json_serializer=_json_ser,
        pool_pre_ping=True,
    )
else:
    SQLITE_URL = "sqlite:///./aidailyflow.db"
    engine = create_engine(
        SQLITE_URL,
        connect_args={"check_same_thread": False},
        json_serializer=_json_ser,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
