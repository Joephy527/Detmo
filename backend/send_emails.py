import os
import re
import smtplib
import ssl
from email.message import EmailMessage
from typing import Dict, Iterable, List, Optional, Tuple
from urllib.parse import urlencode

from pydantic import EmailStr, TypeAdapter

# Email configuration
smtp_server = os.getenv("SMTP_HOST", "")
smtp_port = int(os.getenv("SMTP_PORT", "465"))
smtp_username = os.getenv("SMTP_USER")
smtp_password = os.getenv("SMTP_PASS")
APP_BASE_URL = os.getenv("APP_BASE_URL", "https://app.detmo.com")
BUTTON_COLOR = "#6649B6"

# List of recipients
recipients = [
    "shikhars22@gmail.com",
    "shikhar@ddfao.in",
    "abhishek@detmo.in",
    "joephy527@gmail.com",
]
cc_recipients = ["shikhar@detmo.in", "abhishek@detmo.in"]
recipientFirstNames = ["Shikhar", "Shikhar", "Abhishek", "Yoseph"]

_EMAIL = TypeAdapter(EmailStr)


def _valid_unique_emails(emails: Iterable[str]) -> List[str]:
    out, seen = [], set()
    for e in emails or []:
        if not e:
            continue
        try:
            addr = _EMAIL.validate_python(e).lower()
        except Exception:
            # invalid email → skip
            continue
        if addr not in seen:
            seen.add(addr)
            out.append(addr)
    return out


def _first_name_from_email(email: str) -> str:
    local = email.split("@", 1)[0]
    parts = re.split(r"[._\-+]+", local)
    return parts[0].capitalize() if parts and parts[0] else "there"


def build_referral_url_from_clerk_id(clerk_id: str) -> str:
    return f"{APP_BASE_URL}/sign-up?{urlencode({'ref': clerk_id})}"


def render_invite_email(
    recipient_name: str,
    sender_display: str,
    project_name: str,
    referral_url: str,
    team_role: str | None = None,
) -> Tuple[str, str, str]:
    subject = f"You've been added to “{project_name}” on Detmo"
    role_text = f" as the {team_role}" if team_role else ""

    # Plain text (fallback only; HTML is prioritized by adding it as the rich alternative)
    text = (
        f"Hi {recipient_name},\n\n"
        f"{sender_display} has added you to the {project_name} sourcing project{role_text}.\n"
        f"Please create an account and sign up using the link below:\n"
        f"{referral_url}\n\n"
        f"Login to the app and contact the sender to pay for your account.\n\n"
        f"Thanks\n"
        f"detmo Support\n"
    )

    # HTML mirrors your copy; button color #6649B6
    html = f"""\
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <div style="max-width:560px;margin:24px auto;background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06);overflow:hidden;">
      <div style="padding:24px 24px 0 24px;">
        <p style="margin:0 0 16px 0;">Hi {recipient_name},</p>
        <p style="margin:0 0 16px 0;">
          <strong>{sender_display}</strong> has added you to the <strong>{project_name}</strong> sourcing project{role_text}.
        </p>
        <p style="margin:0 0 16px 0;">Please create an account and sign up using the below link</p>
        <p style="margin:24px 0;">
          <a href="{referral_url}" target="_blank"
             style="background:{BUTTON_COLOR};color:#ffffff;text-decoration:none;display:inline-block;padding:12px 20px;border-radius:8px;font-weight:600;">
            Create your account
          </a>
        </p>
        <p style="margin:16px 0;">Login to the app and contact the sender to pay for your account.</p>
        <p style="margin:24px 0 0 0;">Thanks<br/>detmo Support</p>
      </div>
    </div>
  </body>
</html>
"""
    return subject, text, html


def _send_one_smtp(
    sender_email: str,
    rcpt_email: str,
    subject: str,
    text: str,
    html: str,
    sender_display: str,
):
    if not (smtp_server and smtp_username and smtp_password):
        raise RuntimeError("SMTP configuration is missing")

    msg = EmailMessage()
    msg["From"] = smtp_username
    msg["To"] = rcpt_email
    msg["Subject"] = subject
    msg["Reply-To"] = sender_email
    # Put plain first, then HTML as alternative → most clients prefer the HTML (richer) part.
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    ctx = ssl.create_default_context()

    if smtp_port == 465:
        # Implicit TLS
        with smtplib.SMTP_SSL(smtp_server, smtp_port, context=ctx) as server:
            server.set_debuglevel(1)
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
    else:
        # Plain → STARTTLS (use 587 typically)
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.ehlo()
            server.starttls(context=ctx)
            server.ehlo()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)


def send_project_invites_smtp(
    sender_email: str,
    sender_display: str,
    project_name: str,
    referral_url: str,
    recipient_emails: Iterable[str],
    recipient_roles: Optional[Dict[str, str]] = None,
):
    to_list = _valid_unique_emails(recipient_emails)
    roles = {k.lower(): v for k, v in (recipient_roles or {}).items()}

    if not to_list:
        return

    for rcpt in to_list:
        recipient_name = _first_name_from_email(rcpt)
        team_role = roles.get(rcpt.lower())
        subject, text, html = render_invite_email(
            recipient_name, sender_display, project_name, referral_url, team_role
        )
        try:
            _send_one_smtp(sender_email, rcpt, subject, text, html, sender_display)
        except Exception as e:
            print(f"[SMTP ERROR] {rcpt}: {e}")
