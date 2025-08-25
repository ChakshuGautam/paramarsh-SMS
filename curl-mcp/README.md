# Curl MCP Server

A Model Context Protocol (MCP) server that wraps curl commands and provides JSON output with jq support.

## Features

- Execute curl HTTP requests through MCP
- Support for all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Custom headers and request data
- jq filtering for JSON response processing
- Raw curl command execution
- JSON-formatted output

## Installation

```bash
cd curl-mcp
npm install
```

## Usage

### Tool: `curl`

Structured curl requests with automatic command building:

```javascript
{
  "url": "http://localhost:3001/api/admin/invoices",
  "method": "GET",
  "headers": {
    "x-branch-id": "dps-main",
    "Content-Type": "application/json"
  },
  "jq_filter": ".total"
}
```

### Tool: `curl_raw`

Execute raw curl commands:

```javascript
{
  "command": "curl -X GET \"http://localhost:3001/api/admin/invoices?page=1&perPage=1&sort=-id&status=Overdue\" -H \"x-branch-id: dps-main\" -H \"Content-Type: application/json\"",
  "jq_filter": ".total"
}
```

## Examples

### Get invoice count
```bash
# Using structured curl
{
  "url": "http://localhost:3001/api/admin/invoices?page=1&perPage=1&status=Overdue",
  "headers": {
    "x-branch-id": "dps-main",
    "Content-Type": "application/json"
  },
  "jq_filter": ".total"
}
```

### Raw curl command
```bash
{
  "command": "curl -s -X GET \"http://localhost:3001/api/admin/invoices\" -H \"x-branch-id: dps-main\"",
  "jq_filter": ".data | length"
}
```

## Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "curl": {
      "command": "node",
      "args": ["/path/to/curl-mcp/index.js"]
    }
  }
}
```