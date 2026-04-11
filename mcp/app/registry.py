from app.tools.health import register_health_tools

def register_all_tools(mcp) -> None:
    register_health_tools(mcp)