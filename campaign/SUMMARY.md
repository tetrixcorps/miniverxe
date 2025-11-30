# TETRIX Lead Generation - Setup Complete ✅

## What's Been Done

1. ✅ **Explorium MCP Server Installed**
   - Location: `/campaign/mcp-explorium/`
   - Dependencies installed
   - API key configured in `.env`

2. ✅ **Lead Generation Scripts Created**
   - `generateTETRIXLeads.ts` - Main template script
   - `processExploriumResults.ts` - Process Explorium MCP results
   - `generateLeadsWithExplorium.ts` - Full implementation template
   - `generateRealLeads.ts` - MCP usage template

3. ✅ **Documentation Created**
   - `USE-EXPLORIUM-MCP.md` - Step-by-step guide to use Explorium MCP
   - `EXPLORIUM-LEAD-GENERATION-GUIDE.md` - Comprehensive guide
   - `LEAD-GENERATION-IMPLEMENTATION.md` - Implementation summary
   - `README-LEAD-GENERATION.md` - Quick reference

## Next Steps

### 1. Configure Explorium MCP in Cursor

Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "explorium": {
      "url": "https://mcp.explorium.ai/mcp"
    }
  }
}
```

### 2. Generate Leads Using Cursor AI

Use Cursor's AI chat to query Explorium. Example queries are in `USE-EXPLORIUM-MCP.md`.

### 3. Process Results

After getting results from Explorium MCP, save them to a JSON file and process:

```bash
npm run leads:process healthcare-results.json healthcare
```

### 4. Review Generated Leads

Check the `leads/` directory for processed lead files.

## Files Structure

```
campaign/
├── mcp-explorium/          # Explorium MCP server
├── leads/                  # Generated lead files
├── generateTETRIXLeads.ts  # Main generation script
├── processExploriumResults.ts  # Process MCP results
├── USE-EXPLORIUM-MCP.md    # How to use MCP (START HERE)
└── .env                    # API key configuration
```

## Quick Start

1. Read `USE-EXPLORIUM-MCP.md` for detailed instructions
2. Configure MCP in Cursor
3. Query Explorium using Cursor AI
4. Process results with `npm run leads:process`
5. Import leads into campaign system

## Support

- Explorium MCP Docs: https://developers.explorium.ai/reference/agentsource-mcp
- Cursor MCP Docs: https://docs.cursor.com/context/model-context-protocol
