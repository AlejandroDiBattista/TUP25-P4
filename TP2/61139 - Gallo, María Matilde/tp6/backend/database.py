from sqlmodel import SQLModel, create_engine, Session

DB_URL = "sqlite:///tienda.db"
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
