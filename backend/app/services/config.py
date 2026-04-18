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

settings = Settings()