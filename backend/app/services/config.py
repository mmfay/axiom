import os
from dotenv import load_dotenv

load_dotenv()

def to_bool(value: str | None, default: bool = False) -> bool:
	if value is None:
		return default
	return value.lower() in ("true", "1", "yes", "on")

class Settings:
	IS_PROD: bool = to_bool(os.getenv("IS_PROD"), False)
	DATABASE_URL: str = os.getenv("DATABASE_URL")
	SECRET_KEY: str = os.getenv("SECRET_KEY")
	DEBUG: bool = to_bool(os.getenv("DEBUG"), True)
	AUTO_APPLY_SCHEMA: bool = to_bool(os.getenv("AUTO_APPLY_SCHEMA"), True)
	SMTP_HOST: str = os.getenv("SMTP_HOST")
	SMTP_PORT: int = os.getenv("SMTP_PORT")
	SMTP_USERNAME: str = os.getenv("SMTP_USERNAME")
	SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD")
	SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL")
	SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME")
	SMTP_USE_TLS: bool = to_bool(os.getenv("SMTP_USE_TLS"), True)
	FRONTEND_URL: str = os.getenv("FRONTEND_URL")
	APP_NAME: str = os.getenv("APP_NAME")

settings = Settings()