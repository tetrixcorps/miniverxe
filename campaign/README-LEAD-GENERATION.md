# TETRIX Lead Generation System

## Overview

This system uses the Explorium MCP Server to generate B2B leads for TETRIX services across three main industries:
- **Healthcare**: AI Voice Agents, Benefit Verification, EHR Integration
- **Fleet Management**: Real-time Tracking, Predictive Maintenance, Route Optimization, eSIM
- **Construction**: Project Management, Safety Compliance, Worker Management

## Installation

```bash
cd campaign
npm install
```

## Configuration

Ensure your `.env` file contains:
```env
EXPLORIUM_API_KEY=your_api_key_here
EXPLORIUM_ACCESS_TOKEN=your_access_token_here
```

## Usage

### Generate All Leads

```bash
npm run leads:generate
```

This will generate leads for all three industries and save them to the `leads/` directory.

### Generate Industry-Specific Leads

```bash
# Healthcare leads
npm run leads:healthcare

# Fleet/Logistics leads
npm run leads:fleet

# Construction leads
npm run leads:construction
```

## Output

Leads are saved as JSON files in the `leads/` directory:
- `healthcare-leads-[timestamp].json`
- `fleet-leads-[timestamp].json`
- `construction-leads-[timestamp].json`
- `lead-generation-summary-[timestamp].json`

## Lead Data Structure

Each lead includes:
- Company information (name, domain, industry, size, location)
- Enriched data (employees, revenue, technologies)
- Contacts (decision makers with titles, emails, phones)
- Services needed (matched to TETRIX offerings)
- Match score (relevance rating)

## Integration with Campaign System

Generated leads can be imported into the campaign system:

```typescript
import { ExploriumLeadGenerator } from './exploriumLeadGenerator';
import { CampaignManager } from './api/CampaignManager';

const generator = new ExploriumLeadGenerator();
const leads = await generator.generateHealthcareLeads(50);

// Import into campaign system
const campaignManager = new CampaignManager();
for (const lead of leads) {
  await campaignManager.addLead({
    email: lead.contacts[0]?.email,
    phoneNumber: lead.contacts[0]?.phone,
    company: lead.name,
    industry: lead.industry,
    // ... other fields
  });
}
```

## Using Explorium MCP Server

The Explorium MCP server provides access to:
- Company search and enrichment
- Contact discovery
- Business intelligence
- Real-time data

When using the MCP server in Cursor, you can query:
- "Find healthcare companies that need patient communication systems"
- "Search for fleet management companies with 50-500 vehicles"
- "Get contacts at construction companies for safety compliance software"

## Next Steps

1. Review generated leads in the `leads/` directory
2. Enrich leads with additional data using Explorium
3. Import qualified leads into the campaign system
4. Create targeted email/SMS campaigns
5. Track conversion rates and optimize targeting


