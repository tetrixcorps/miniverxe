# How to Use Explorium MCP to Generate Real Leads

## ✅ Current Status

- ✅ Explorium MCP server installed in `/campaign/mcp-explorium/`
- ✅ API key configured in `.env`
- ✅ Lead generation scripts created
- ⏳ **Next Step**: Configure MCP in Cursor and generate leads

## 🔧 Step 1: Configure Explorium MCP in Cursor

### Option A: Using Cursor Settings UI

1. Open Cursor
2. Go to: `Settings` → `Cursor Settings` → `MCP` → `Add new global MCP server`
3. Add the following configuration:

```json
{
  "mcpServers": {
    "explorium": {
      "url": "https://mcp.explorium.ai/mcp"
    }
  }
}
```

### Option B: Manual Configuration

Edit `~/.cursor/mcp.json` (create if it doesn't exist):

```json
{
  "mcpServers": {
    "explorium": {
      "url": "https://mcp.explorium.ai/mcp"
    }
  }
}
```

**Note**: Remote MCP connections don't require an API key - authentication is handled automatically.

## 🚀 Step 2: Generate Leads Using Cursor AI

Once Explorium MCP is configured, you can use Cursor's AI chat to query Explorium directly. Here are the exact queries to use:

### Healthcare Leads

**Query 1:**
```
Find healthcare companies with 50-500 employees that use Epic or Cerner EHR systems and need patient communication solutions. Get their company details including name, domain, location, employee count, and revenue. Then find IT directors or operations managers at these companies with their email addresses and phone numbers.
```

**Query 2:**
```
Search for medical practices with 100-300 employees that need HIPAA-compliant communication platforms and benefit verification automation. Enrich the company data and find practice managers with contact information.
```

**Query 3:**
```
Find hospitals and health systems with 200-500 employees using patient portals that need prior authorization automation. Get contacts for healthcare administrators and IT directors with emails and phone numbers.
```

### Fleet Management Leads

**Query 1:**
```
Find fleet management companies with 100-500 vehicles that need real-time tracking and route optimization. Get fleet managers and operations directors with their emails and phone numbers. Include company details like name, domain, location, and fleet size.
```

**Query 2:**
```
Search for logistics companies with 50-500 employees that need predictive maintenance and driver behavior analytics. Enrich the company data and find decision makers with contact information.
```

**Query 3:**
```
Find trucking companies with 50-200 vehicles that need eSIM connectivity and telematics solutions. Get contacts for fleet managers and IT directors with emails and phone numbers.
```

### Construction Leads

**Query 1:**
```
Find general contractors with 50-500 employees that need project management software and safety compliance monitoring. Get project managers and safety officers with contact information including emails and phone numbers.
```

**Query 2:**
```
Search for construction companies with 100-300 employees that need worker management and resource allocation tools. Enrich the data and find operations managers with contact details.
```

**Query 3:**
```
Find commercial construction firms with 200-500 employees that need progress reporting and safety incident tracking. Get contacts for project managers and safety officers with emails and phone numbers.
```

## 📋 Step 3: Process Results

Once you have the results from Explorium MCP, save them to JSON files in the `leads/` directory. The expected format is:

```json
{
  "company": {
    "name": "Company Name",
    "domain": "company.com",
    "industry": "healthcare",
    "employees": 250,
    "location": {
      "city": "City",
      "state": "State",
      "country": "US"
    }
  },
  "contacts": [
    {
      "name": "John Doe",
      "title": "IT Director",
      "email": "john@company.com",
      "phone": "+1-555-123-4567"
    }
  ],
  "tetrixServices": [
    "AI Voice Agents for healthcare communications",
    "EHR/EMR system integration"
  ],
  "matchScore": 85
}
```

## 🔄 Step 4: Use the Processing Script

After saving your Explorium results, you can use the `processExploriumResults.ts` script to format and save them properly:

```bash
cd /home/diegomartinez/Desktop/tetrix/campaign
ts-node processExploriumResults.ts healthcare-results.json
```

## 📊 Expected Output

After processing, you'll have JSON files in `leads/` directory with:
- Company information
- Enriched contact data
- Matched TETRIX services
- Match scores (0-100)

## 💡 Tips

1. **Start Small**: Generate 10-20 leads per industry first to test the process
2. **Verify Contacts**: Ensure email addresses and phone numbers are valid
3. **Match Scores**: Prioritize leads with match scores above 70
4. **Segment**: Group leads by industry and service needs for targeted campaigns

## 🆘 Troubleshooting

### MCP Server Not Available

If Explorium MCP doesn't appear in Cursor:
1. Restart Cursor after adding the configuration
2. Check `~/.cursor/mcp.json` syntax is valid JSON
3. Verify you're using the latest version of Cursor

### No Results from Queries

If queries return no results:
1. Try broader search terms
2. Adjust company size filters
3. Use more general industry keywords

### API Key Issues

**Note**: Remote MCP connections (`https://mcp.explorium.ai/mcp`) don't require an API key. The API key in `.env` is only needed for:
- Docker self-hosting
- Direct REST API calls (if available)

## 📚 Additional Resources

- [Explorium MCP Documentation](https://developers.explorium.ai/reference/agentsource-mcp)
- [Cursor MCP Documentation](https://docs.cursor.com/context/model-context-protocol)
- Lead Generation Guide: `EXPLORIUM-LEAD-GENERATION-GUIDE.md`


