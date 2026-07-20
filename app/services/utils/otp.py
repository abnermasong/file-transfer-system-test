import hashlib
import hmac
import secrets


def generate_otp() -> str:
    """Generates a 6-digit numeric OTP, per requirements section 3.4."""
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp: str) -> str:
    """Hashes the OTP before it's ever written to the DB."""
    return hashlib.sha256(otp.encode()).hexdigest()


def otp_matches_hash(otp: str, otp_hash: str) -> bool:
    """Timing-safe comparison to avoid leaking match info via response timing."""
    return hmac.compare_digest(hash_otp(otp), otp_hash)
