import os
from html import escape

import resend


def send_upload_notification_email(
    *, recipient_email: str, download_url: str, file_name: str, expires_at: str
) -> None:
    resend.api_key = os.getenv("RESEND_API_KEY", "")
    sender_email = os.getenv("RESEND_SENDER_EMAIL", "onboarding@resend.dev")
    escaped_file_name = escape(file_name)
    escaped_download_url = escape(download_url, quote=True)
    escaped_expires_at = escape(expires_at)
    html_body = f"""
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
        A file is ready for you to download.
    </div>
    <div style="margin: 0; padding: 40px 16px; background-color: #f3f4f6; font-family: Arial, sans-serif; color: #111827;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
                <td align="center">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                           style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
                        <tr>
                            <td style="padding: 40px;">
                                <p style="margin: 0 0 12px; color: #2563eb; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em;">
                                    A file has been shared with you
                                </p>

                                <div style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
                                    <p style="margin: 0; text-align: center; font-size: 16px; font-weight: bold; line-height: 1.5; overflow-wrap: anywhere;">
                                        {escaped_file_name}
                                    </p>
                                </div>

                                <a href="{escaped_download_url}"
                                   style="display: inline-block; padding: 13px 22px; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px;">
                                    Download file
                                </a>

                                <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                                    This download link expires on <strong>{escaped_expires_at}</strong>.
                                </p>

                                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; line-height: 1.5;">
                                        If the button does not work, copy and paste this link into your browser:
                                    </p>
                                    <a href="{escaped_download_url}"
                                       style="color: #2563eb; font-size: 12px; line-height: 1.5; overflow-wrap: anywhere;">
                                        {escaped_download_url}
                                    </a>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
    """

    resend.Emails.send(
        {
            "from": sender_email,
            "to": [recipient_email],
            "subject": f"A file has been shared with you: {file_name}",
            "text": (
                f"A file has been shared with you.\n\n"
                f"File name: {file_name}\n"
                f"Download link: {download_url}\n"
                f"This link expires on: {expires_at}\n"
            ),
            "html": html_body,
        }
    )
