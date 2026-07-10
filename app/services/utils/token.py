import secrets


def generate_download_token() -> str:
    """Generate a random download token."""
    return secrets.token_urlsafe(32)
