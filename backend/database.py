from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database URL format:
# postgresql://username:password@localhost/databasename
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:password@localhost/cityvoice"
)

# Creates a database engine (connection)
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal is what we’ll use inside routes to talk to the DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is used to define tables in models.py
Base = declarative_base()
