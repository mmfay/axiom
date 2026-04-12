from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()


class Settings(BaseModel):
    mcp_server_name: str = os.getenv("MCP_SERVER_NAME", "axiom-mcp")
    erp_backend_url: str = os.getenv("ERP_BACKEND_URL", "http://localhost:8000")


settings = Settings()