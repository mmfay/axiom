# Axiom MCP Server

## Overview

The **Axiom MCP Server** is a Model Context Protocol (MCP) service that exposes Axiom functionality as structured, AI-consumable tools.

It acts as a **bridge between AI assistants and the Axiom ERP backend**, allowing natural language requests to safely trigger business operations such as:

* Creating journal entries
* Retrieving master data (accounts, items, vendors)
* Performing inventory actions
* Executing workflow-driven operations

---

## Architecture

The MCP server is **not Axiom itself**. It is an abstraction layer that:

1. Receives tool calls from an AI assistant
2. Validates and structures inputs
3. Calls the Axiom backend API
4. Returns structured results

```text
User → AI Assistant → MCP Server → Axiom Backend → Database
```

### Key Principles

* **Backend owns business logic**
* **MCP exposes safe, AI-friendly tools**
* **No direct database access from MCP**
* **All actions flow through backend APIs or services**

---

## Project Structure

```text
mcp/
  app/
    server.py        # MCP server entrypoint
    config.py        # Environment + settings
    registry.py      # Tool registration
    tools/           # Domain-based tool definitions
      health.py
      gl.py
  requirements.txt
  .env
```

---

## Requirements

* Python 3.10+
* Virtual environment (recommended)

---

## Setup

### 1. Create virtual environment

```bash
cd mcp
python3 -m venv venv
source venv/bin/activate
```

---

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 3. Configure environment

Create a `.env` file:

```env
ERP_BACKEND_URL=http://localhost:8000
MCP_SERVER_NAME=axiom-mcp
```

---

## Running the MCP Server

Start the server:

```bash
python -m app.server
```

You should see the MCP server start and register tools.

---

## Available Tools (Example)

### Health

* `ping` → basic connectivity check
* `erp_mcp_status` → returns MCP server status

### General Ledger

* `get_main_accounts` → fetch accounts from ERP
* `create_journal_line` → create a journal line

---

## How Tools Work

Each tool:

* is defined with `@mcp.tool()`
* has a clear name and description
* accepts structured inputs
* returns structured outputs

Example:

```python
@mcp.tool()
async def create_journal_line(
    journal_id: str,
    account_id: int,
    description: str,
    debit: float = 0.0,
    credit: float = 0.0,
) -> dict:
```

---

## Integration with Backend

The MCP server communicates with the ERP backend using HTTP:

```text
MCP Tool → httpx → FastAPI Backend → Database
```

Future optimization may allow direct service imports for tighter coupling.

---

## Development Guidelines

### Add a new tool

1. Create or update a file in `app/tools/`
2. Define tool using `@mcp.tool()`
3. Register it in `registry.py`

---

### Tool design best practices

* Keep tools **high-level and intent-driven**
* Avoid exposing raw CRUD endpoints directly
* Always validate inputs
* Return consistent response structures

---

## Example Use Case

User asks:

> “Create a journal entry for $500 to Office Supplies”

Flow:

1. AI selects `create_journal_line`
2. MCP validates input
3. MCP calls backend API
4. Backend applies business rules
5. Response returned to AI

---

## Future Enhancements

* Structured input schemas using Pydantic
* Permission-aware tool execution
* Audit logging for AI-triggered actions
* RAG integration for contextual ERP knowledge
* Tool grouping by ERP modules (GL, Inventory, Purchasing)

---

## Notes

* This service is intended for **internal AI integration**
* Do not expose publicly without authentication and security controls
* Always ensure backend enforces all critical business rules

---

## Summary

The MCP server transforms Axiom into an **AI-native ERP system** by:

* exposing business capabilities as tools
* enabling natural language interaction
* maintaining strict control over execution paths

---
