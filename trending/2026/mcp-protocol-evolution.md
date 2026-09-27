# Model Context Protocol (MCP) Evolution [ACTIVE]

**Last Updated:** 2026-09-26

---

## What Is MCP?

The Model Context Protocol (MCP) is an open standard originally developed by Anthropic that defines how AI applications (clients) communicate with external data sources and tools (servers). It provides a uniform interface for LLM-based applications to discover, authenticate with, and invoke tools -- replacing the fragmented landscape of custom integrations.

Think of MCP as a "USB-C for AI tools": a single protocol that any AI application can use to connect to any compatible service, without writing bespoke integration code for each one.

## What MCP Standardizes

1. **Tool discovery** -- Clients can query an MCP server to learn what tools are available, including their names, descriptions, and input schemas.
2. **Tool invocation** -- A standardized JSON-RPC-based mechanism for calling tools and receiving results.
3. **Resource access** -- A way to expose contextual data (files, database records, API responses) to the model in a structured format.
4. **Prompts** -- Reusable prompt templates that servers can expose to clients.
5. **Transport layer** -- Supports multiple transports (stdio for local processes, HTTP with SSE for remote servers).

## How MCP Differs from Direct API Integration

| Aspect | Direct API Integration | MCP |
|--------|----------------------|-----|
| **Discovery** | Developer must read docs and hardcode available functions | Client dynamically discovers tools from server at runtime |
| **Schema format** | Varies per API (OpenAPI, GraphQL, custom) | Standardized JSON Schema via MCP protocol |
| **Authentication** | Custom per service | Handled at the transport/server level; transparent to client |
| **Error handling** | Custom per integration | Standardized error responses |
| **Reusability** | Each AI app re-implements integrations | One MCP server serves any MCP-compatible client |
| **Maintenance** | N clients x M tools = N*M integrations | N clients + M servers = N+M integrations |

## Example: MCP vs. Direct API Call

### Direct API Integration (traditional approach)

```python
# Developer must: read API docs, write custom code, handle auth, parse responses
import requests

def search_jira_issues(query: str, api_key: str) -> list:
    """Custom integration -- tightly coupled to Jira's REST API."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    response = requests.get(
        "https://your-domain.atlassian.net/rest/api/3/search",
        headers=headers,
        params={"jql": query}
    )
    response.raise_for_status()
    return response.json()["issues"]

# In your LLM tool definition (OpenAI-style):
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_jira_issues",
            "description": "Search Jira issues by JQL query",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "JQL query string"}
                },
                "required": ["query"]
            }
        }
    }
]
# You must manually wire this for every tool, every API, every client.
```

### MCP Approach

```python
# The MCP server for Jira handles all API details internally.
# Your AI client only needs to speak MCP.

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def use_jira_via_mcp():
    server_params = StdioServerParameters(
        command="npx",
        args=["-y", "@modelcontextprotocol/server-jira"]
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # Discover tools dynamically -- no hardcoding
            tools = await session.list_tools()

            # Invoke any discovered tool uniformly
            result = await session.call_tool(
                "search_issues",
                arguments={"jql": "project = ENG AND status = Open"}
            )
            return result
```

The key difference: the MCP client does not need to know anything about Jira's REST API. It discovers and invokes tools through a uniform protocol. The same client code works with any MCP server (Jira, Slack, GitHub, databases, file systems, etc.).

## MCP Architecture: Servers and Clients

### MCP Servers

An MCP server wraps an external service or data source and exposes it through the MCP protocol. Examples:

- **File system server** -- Exposes local file read/write operations
- **Database server** -- Exposes query capabilities for PostgreSQL, SQLite, etc.
- **SaaS servers** -- Wrap APIs for GitHub, Slack, Jira, Google Drive, etc.
- **Custom servers** -- Any internal tool or service can be wrapped

Servers can be run locally (via stdio transport) or remotely (via HTTP/SSE transport).

### MCP Clients

An MCP client is any AI application that speaks the MCP protocol. Examples:

- Claude Desktop
- Claude Code (CLI)
- Cursor
- Windsurf
- Custom applications built with MCP client SDKs

### Host Applications

The host is the top-level application (e.g., an IDE or chat interface) that manages one or more MCP client-server connections and mediates security/consent.

## Current Adoption

- **Anthropic** -- Native MCP support in Claude Desktop and Claude Code. Maintains official MCP SDKs (Python, TypeScript, Java, Kotlin, C#).
- **IDE tools** -- Cursor, Windsurf, and other AI-powered editors have adopted MCP for tool integration.
- **Community servers** -- Growing ecosystem of open-source MCP servers for common services (GitHub, Slack, PostgreSQL, Brave Search, Google Maps, and many more).
- **Enterprise** -- Organizations building internal MCP servers to expose proprietary tools and data to AI assistants.

## Impact on Tool Use in AI Applications

1. **Reduced integration cost** -- Engineers no longer need to write and maintain custom integrations for each tool. Adopting a new tool means pointing the client at a new MCP server.
2. **Composability** -- An AI agent can connect to multiple MCP servers simultaneously, gaining access to a wide range of tools without additional code.
3. **Ecosystem effects** -- As more servers are published, the marginal cost of adding new capabilities to an AI app approaches zero.
4. **Security model** -- MCP introduces a structured way to handle permissions and consent for tool use, which is critical for production deployments.
5. **Interoperability** -- A tool exposed via MCP works with any MCP-compatible client, avoiding vendor lock-in.

## Limitations and Open Questions

- **Authentication standards** -- OAuth and token management across remote MCP servers is still maturing.
- **Performance** -- The extra abstraction layer introduces some overhead compared to direct API calls.
- **Versioning** -- How MCP servers handle breaking changes in underlying APIs is not fully standardized.
- **Competing standards** -- Other tool-use protocols may emerge; it is unclear if MCP will become the universal standard.

## Further Reading

- MCP specification: https://modelcontextprotocol.io
- Anthropic MCP announcement and documentation
- Official MCP SDKs on GitHub (modelcontextprotocol organization)
- Community MCP server registry
