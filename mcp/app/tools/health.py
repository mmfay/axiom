def register_health_tools(mcp):
    @mcp.tool()
    def ping() -> str:
        """Simple health check tool."""
        return "pong"

    @mcp.tool()
    def erp_mcp_status() -> dict:
        """Return basic MCP server status."""
        return {
            "status": "ok",
            "service": "axiom-mcp",
            "domain": "erp",
        }