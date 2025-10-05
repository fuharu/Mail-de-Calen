from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# データベースファイルのパス
DATABASE_URL = "sqlite:///./app.db"

# SQLAlchemyエンジンを作成
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# セッションファクトリーを作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ベースクラスを作成
Base = declarative_base()

# データベースセッションの依存性注入用
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# データベーステーブルを作成
def create_tables():
    Base.metadata.create_all(bind=engine)
