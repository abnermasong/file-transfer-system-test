from fastapi import Header, HTTPException, status

from app.db.supabase import get_supabase_client


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header.",
        )
    return authorization.split(" ", 1)[1].strip()


def require_admin_session(authorization: str | None = Header(default=None)) -> dict:
    token = _extract_bearer_token(authorization)
    client = get_supabase_client()

    try:
        result = client.auth.get_user(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid.",
        )

    user = getattr(result, "user", None)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid.",
        )

    return {"id": user.id, "email": user.email}
