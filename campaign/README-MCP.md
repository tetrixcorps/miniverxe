# Explorium MCP Server Integration

This directory contains the Explorium MCP (Model Context Protocol) server integration for the TETRIX Campaign System.

## Overview

The Explorium Business Data Hub provides access to:
- **Company Search & Enrichment**: Find companies by name, domain, or attributes
- **Contact Discovery**: Locate and enrich professional contact information
- **Business Intelligence**: Access technology stack, funding history, growth signals
- **Real-Time Data**: Up-to-date information from trusted external data sources

## Installation

The MCP server is installed in the `mcp-explorium/` directory. Dependencies have been installed via npm.

## Configuration

### For Cursor IDE

Add this to your `~/.cursor/mcp.json` file:

```json
{
  "mcpServers": {
    "explorium": {
      "url": "https://mcp.explorium.ai/mcp"
    }
  }
}
```

Or for local server connection:

```json
{
  "mcpServers": {
    "explorium": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.explorium.ai/mcp"]
    }
  }
}
```

### For Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "explorium": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.explorium.ai/mcp"]
    }
  }
}
```

## Usage

The MCP server can be used to:
1. Search for companies and get detailed firmographics
2. Find contacts within companies
3. Get business intelligence and enrichment data
4. Track business events and changes

## API Key Configuration

The Explorium API key has been configured in the `.env` file:
- `EXPLORIUM_API_KEY` - API key for Explorium services
- `EXPLORIUM_ACCESS_TOKEN` - Access token for authentication

For Docker deployment or to get a new API key, visit: https://admin.explorium.ai/api-key

## Documentation

- [Explorium MCP Documentation](https://developers.explorium.ai/reference/agentsource-mcp)
- [GitHub Repository](https://github.com/explorium-ai/mcp-explorium)
- [Support & Help Center](https://developers.explorium.ai/reference/support-help-center)

## Files

- `mcp-explorium/` - Explorium MCP server repository
- `mcp-config.json` - MCP server configuration file
- `README-MCP.md` - This file

