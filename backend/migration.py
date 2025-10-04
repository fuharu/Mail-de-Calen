from sqlalchemy import create_engine
from databases.model import ToDo
from dotenv import load_dotenv
import os

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
ToDo.metadata.create_all(bind=engine)
