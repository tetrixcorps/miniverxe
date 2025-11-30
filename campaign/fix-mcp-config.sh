#!/bin/bash
# Fix the MCP configuration file

MCP_FILE="$HOME/.cursor/mcp.json"

# Create backup
cp "$MCP_FILE" "$MCP_FILE.backup" 2>/dev/null || true

# Create corrected MCP config
cat > "$MCP_FILE" << 'EOF'
{
  "mcpServers": {
    "TalkToFigma": {
      "command": "bunx",
      "args": [
        "cursor-talk-to-figma-mcp@latest"
      ]
    },
    "explorium-mcp": {
      "type": "sse",
      "url": "https://mcp.explorium.ai/sse",
      "headers": {
        "api_key": "094a3192008246868f06bf08fbbab724"
      }
    }
  }
}
EOF

echo "✅ Fixed MCP configuration file"
echo "📁 Backup saved to: $MCP_FILE.backup"
echo ""
echo "⚠️  Please restart Cursor for changes to take effect"


