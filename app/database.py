import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

# Create database engine
database_connector = create_engine(DATABASE_URL)

# Base class for all ORM models
Base = declarative_base()


class Articles(Base):

    """
    SQLAlchemy ORM model for the 'articles' table.
    """
    __tablename__ = "articles"

    articleID = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(30), nullable=False)
    author = Column(String(25), nullable=False)
    category = Column(String(30))
    

# Create all tables in the database (if not already created)
Base.metadata.create_all(database_connector)