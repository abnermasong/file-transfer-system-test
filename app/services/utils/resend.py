import os
from datetime import datetime
from html import escape
from zoneinfo import ZoneInfo


import resend


def send_upload_notification_email(
    *, recipient_email: str, download_url: str, file_name: str, expires_at: str
) -> None:
    resend.api_key = os.getenv("RESEND_API_KEY", "")
    sender_email = os.getenv("RESEND_SENDER_EMAIL", "onboarding@resend.dev")

    now_jst = datetime.now(ZoneInfo("Asia/Tokyo"))
    sent_at = now_jst.strftime("%Y年%m月%d日 %H:%M:%S（日本時間）")

    escaped_file_name = escape(file_name)
    escaped_download_url = escape(download_url, quote=True)
    escaped_expires_at = escape(expires_at)

    html_body = f"""
    <div style="margin: 0; padding: 40px 16px; background-color: #f3f4f6; font-family: Arial, sans-serif; color: #111827;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
                <td align="center">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                           style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
                        <tr>
                            <td style="padding: 40px; text-align: center;">
                                <p style="margin: 0 0 12px; color: #2563eb; font-size: 16px; font-weight: bold; text-align: left; text-transform: uppercase; letter-spacing: 0.08em;">
                                    ファイルがあなたに共有されました
                                </p>

                                <div style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
                                    <p style="margin: 0; text-align: center; font-size: 16px; font-weight: bold; line-height: 1.5; overflow-wrap: anywhere;">
                                        {escaped_file_name}
                                    </p>
                                </div>

                                <a href="{escaped_download_url}"
                                   style="display: inline-block; padding: 13px 22px; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px;">
                                    OTPをリクエストする
                                </a>

                                <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                                    ダウンロードリンクの有効期限：<strong>{escaped_expires_at}</strong>
                                </p>

                                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; line-height: 1.5;">
                                        ボタンが機能しない場合は、次のリンクをコピーしてブラウザに貼り付けてください：
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
            "subject": f"A file has been shared with you:{file_name} — {sent_at}",
            "text": (
                f"ファイルがあなたに共有されました\n\n"
                f"ファイル名：{file_name}\n"
                f"ダウンロードリンク：{download_url}\n"
                f"リンクの有効期限：{expires_at}\n"
            ),
            "html": html_body,
        }
    )


def send_otp_email(*, recipient_email: str, otp: str) -> None:
    resend.api_key = os.getenv("RESEND_API_KEY", "")
    sender_email = os.getenv("RESEND_SENDER_EMAIL", "onboarding@resend.dev")

    now_jst = datetime.now(ZoneInfo("Asia/Tokyo"))
    sent_at = now_jst.strftime("%Y年%m月%d日 %H:%M:%S（日本時間）")

    escaped_otp = escape(otp)

    html_body = f"""
    <div style="margin: 0; padding: 40px 16px; background-color: #f3f4f6; font-family: Arial, sans-serif; color: #111827;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
                <td align="center">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                           style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
                        <tr>
                            <td style="padding: 40px;">
                                <p style="margin: 0 0 12px; color: #2563eb; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em;">
                                    OTPコード
                                </p>

                                <div style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
                                    <p style="margin: 0; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; line-height: 1.5;">
                                        {escaped_otp}
                                    </p>
                                </div>

                                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                                    このOTPの有効期間は<strong>10分</strong>間のみであり、1回のみ使用可能です。
                                </p>
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
            "subject": f"OTP — {sent_at}",
            "text": (
                f"OTPコード{otp}\n\n"
                f"このOTPの有効期間は10分間のみであり、1回のみ使用可能です。"
            ),
            "html": html_body,
        }
    )
