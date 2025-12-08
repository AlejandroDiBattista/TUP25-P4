from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "sqlite:///./tienda_tp6.db"

engine = create_engine(DATABASE_URL, echo=False)


def crear_bd_y_tablas() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
