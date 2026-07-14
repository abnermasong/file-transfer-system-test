import os

import resend


def send_upload_notification_email(
    *, recipient_email: str, file_name: str, expires_at: str
) -> None:

    resend.api_key = os.getenv("RESEND_API_KEY", "")
    sender_email = os.getenv("RESEND_SENDER_EMAIL", "onboarding@resend.dev")

    resend.Emails.send(
        {
            "from": sender_email,
            "to": [recipient_email],
            "subject": f"A file has been shared to you: {file_name}",
            "text": (
                f"A file has been shared with you.\n\n"
                f"File name: {file_name}\n"
                f"This link expires on: {expires_at}\n\n"
            ),
        }
    )
