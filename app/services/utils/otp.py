import hashlib
import secrets


def generate_otp() -> str:
    """Generates a 6-digit numeric OTP, per requirements section 3.4."""
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp: str) -> str:
    """Hashes the OTP before it's ever written to the DB."""
    return hashlib.sha256(otp.encode()).hexdigest()
