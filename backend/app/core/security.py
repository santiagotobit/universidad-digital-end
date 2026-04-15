from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _validate_bcrypt_password_bytes(password: str) -> None:
    """bcrypt admite máximo 72 bytes en UTF-8."""
    if len(password.encode("utf-8")) > 72:
        raise ValueError("La contraseña no puede superar 72 bytes en UTF-8.")


def hash_password(password: str) -> str:
    """Genera un hash seguro para contraseñas."""
    _validate_bcrypt_password_bytes(password)
    return _pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verifica una contraseña contra su hash."""
    try:
        _validate_bcrypt_password_bytes(password)
    except ValueError:
        # Si viene una contraseña demasiado larga, nunca coincidirá con el hash almacenado.
        return False
    return _pwd_context.verify(password, hashed_password)


def create_access_token(subject: str, jti: str, expires_minutes: int | None = None) -> str:
    """Crea un JWT firmado."""

    expires = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.jwt_expiration_minutes
    )
    if not settings.jwt_secret:
        raise RuntimeError("APP_JWT_SECRET no configurado.")
    payload: dict[str, Any] = {"sub": subject, "jti": jti, "exp": expires}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decodifica un JWT y retorna su payload."""

    if not settings.jwt_secret:
        raise RuntimeError("APP_JWT_SECRET no configurado.")
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


def is_jwt_error(exc: Exception) -> bool:
    return isinstance(exc, JWTError)
