import smtplib
import hashlib
import secrets
from email.message import EmailMessage
from pathlib import Path
from string import Template
from typing import Optional

from app.services.config import settings

from app.tables import Tokens, Users

from app.enums.baseEnums import TokenType

class Mailer:

	def __init__(self):

		self.smtp_host = settings.SMTP_HOST
		self.smtp_port = settings.SMTP_PORT
		self.smtp_username = settings.SMTP_USERNAME
		self.smtp_password = settings.SMTP_PASSWORD
		self.from_email = settings.SMTP_FROM_EMAIL
		self.from_name = settings.SMTP_FROM_NAME
		self.use_tls = settings.SMTP_USE_TLS

		self.template_dir = Path(__file__).resolve().parent.parent / "templates" / "email"

	def _render_template(self, template_name: str, context: dict) -> str:
		template_path = self.template_dir / template_name

		if not template_path.exists():
			raise FileNotFoundError(f"Email template not found: {template_path}")

		template_text = template_path.read_text(encoding="utf-8")
		return Template(template_text).safe_substitute(**context)

	def _build_message(
		self,
		to_email: str,
		subject: str,
		html_body: str,
		text_body: Optional[str] = None,
	) -> EmailMessage:
		msg = EmailMessage()
		msg["Subject"] = subject
		msg["From"] = f"{self.from_name} <{self.from_email}>"
		msg["To"] = to_email

		if text_body:
			msg.set_content(text_body)
		else:
			msg.set_content("Please view this email in an HTML-compatible email client.")

		msg.add_alternative(html_body, subtype="html")
		return msg

	def send_email(
		self,
		to_email: str,
		subject: str,
		html_body: str,
		text_body: Optional[str] = None,
	) -> None:
		msg = self._build_message(
			to_email=to_email,
			subject=subject,
			html_body=html_body,
			text_body=text_body,
		)

		with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
			server.ehlo()

			if self.use_tls:
				server.starttls()
				server.ehlo()

			server.login(self.smtp_username, self.smtp_password)
			server.send_message(msg)

	async def send_verify_account_email(self, user: Users) -> None:

		raw_token = secrets.token_urlsafe(32)

		hashed_token = hashlib.sha256(raw_token.encode()).hexdigest()

		token = Tokens(
			user_id = user.id,
			type = TokenType.EMAIL_VERIFICATION,
			token_hash=hashed_token
		)

		token = await token.insert()

		verify_url = f"{settings.FRONTEND_URL}/verify-account?token={raw_token}"

		context = {
			"app_name": settings.APP_NAME,
			"verify_url": verify_url,
		}

		html_body = self._render_template("verify_account.html", context)

		text_body = (
			f"Verify your account for {settings.APP_NAME}\n\n"
			f"Open this link to verify your account:\n{verify_url}\n"
		)

		self.send_email(
			to_email=user.email,
			subject=f"Verify your {settings.APP_NAME} account",
			html_body=html_body,
			text_body=text_body,
		)

	async def send_reset_password_email(self, user: Users) -> None:

		user = await Users.findByEmail(user.email)

		raw_token = secrets.token_urlsafe(32)

		hashed_token = hashlib.sha256(raw_token.encode()).hexdigest()

		token = Tokens(
			user_id = user.id,
			type = TokenType.PASSWORD_RESET,
			token_hash=hashed_token
		)

		token = await token.insert()

		reset_url = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"

		context = {
			"app_name": settings.APP_NAME,
			"reset_url": reset_url,
		}

		html_body = self._render_template("reset_password.html", context)

		text_body = (
			f"Reset your password for {settings.APP_NAME}\n\n"
			f"Open this link to reset your password:\n{reset_url}\n"
		)

		self.send_email(
			to_email=user.email,
			subject=f"Reset your {settings.APP_NAME} password",
			html_body=html_body,
			text_body=text_body,
		)

mailer = Mailer()