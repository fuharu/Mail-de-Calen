from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from sqlalchemy.orm import declarative_base

Base = declarative_base()


# class Question(Base):
#     __tablename__ = "questions"
#     id = Column(Integer, primary_key=True)
#     question = Column(String, unique=True, index=True)
#     tag = Column(String, unique=True, index=True)
#     detail = Column(String, unique=True, index=True)
#     created_at = Column(DateTime, default=datetime.now())

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# データベースURLを環境変数から取得
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

# SQLAlchemyエンジンの作成
engine = create_engine(DATABASE_URL)

# セッションの作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ベースクラスの作成
Base = declarative_base()


class ToDo(Base):
    __tablename__ = "todos"
    id = Column(Integer, primary_key=True)
    user_id = Column(String, index=True)
    title = Column(String, unique=True, index=True)
    description = Column(String, index=True)
    status = Column(String, index=True)
    priority = Column(String, index=True)
    due_date = Column(DateTime, index=True)
    completed = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
