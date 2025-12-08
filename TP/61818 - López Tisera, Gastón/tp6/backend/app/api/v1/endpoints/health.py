from fastapi import APIRouter

router = APIRouter()


@router.get("/health", summary="Health check")
def read_health() -> dict[str, str]:
    """Return a simple health check payload."""
    return {"status": "ok"}

