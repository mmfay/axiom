from fastmcp import FastMCP
from app.config import settings
from app.registry import register_all_tools

mcp = FastMCP(settings.mcp_server_name)

register_all_tools(mcp)

if __name__ == "__main__":
    mcp.run()