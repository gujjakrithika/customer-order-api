from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
 
DATABASE_URL = "postgresql+psycopg2://postgres:Krithika%402751@localhost:5432/customer_order_db"
 
engine = create_engine(DATABASE_URL)
 
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
 
Base = declarative_base()
 