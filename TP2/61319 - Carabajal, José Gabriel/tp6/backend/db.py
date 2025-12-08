from sqlmodel import SQLModel, Session, create_engine

engine = create_engine("sqlite:///./tp6.db", echo=False)

def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
