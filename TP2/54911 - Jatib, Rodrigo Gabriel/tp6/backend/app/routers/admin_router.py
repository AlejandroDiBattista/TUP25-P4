from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from sqlmodel import SQLModel
from ..db import engine

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/clear")
def clear_database():
    """Dangerous: drops and recreates all tables. Use only for dev/test environments."""
    try:
        # drop all tables and recreate schema
        SQLModel.metadata.drop_all(engine)
        SQLModel.metadata.create_all(engine)
        return JSONResponse(status_code=200, content={"status": "ok", "message": "Database cleared and schema recreated"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
