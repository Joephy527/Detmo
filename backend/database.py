import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

# DB_URL = os.getenv("DB_URL",'postgresql://postgres:shiv@localhost/ssdev')
DB_URL = os.getenv("DB_URL", "")

engine = create_engine(DB_URL, echo=True, pool_recycle=1800)
# engine2 = create_engine(DB_URL, echo=True)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


Base = declarative_base()

#  database view
