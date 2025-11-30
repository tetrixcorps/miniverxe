# Explorium MCP Lead Generation Guide

## Overview

This guide explains how to use the Explorium MCP Server to generate B2B leads for TETRIX services across healthcare, fleet management, and construction industries.

## TETRIX Services Offered

### 🏥 Healthcare Services
- AI Voice Agents for healthcare communications
- Benefit Verification & Prior Authorization automation
- Prescription Follow-ups and medication management
- Patient Communication workflows
- EHR/EMR system integration
- HIPAA-compliant communication platform

**Target Companies:**
- Healthcare providers (50-500 employees)
- Medical practices
- Hospitals and health systems
- Clinics using EHR/EMR systems

**Target Contacts:**
- IT Directors
- Operations Managers
- Practice Managers
- Chief Medical Officers
- Healthcare Administrators

### 🚛 Fleet Management Services
- Real-time Fleet Tracking
- Predictive Maintenance with AI
- Driver Behavior Analytics
- Route Optimization
- Telemetry Data collection
- eSIM for vehicle connectivity

**Target Companies:**
- Fleet management companies (50-500 vehicles)
- Logistics and transportation companies
- Trucking companies
- Delivery services

**Target Contacts:**
- Fleet Managers
- Operations Managers
- Logistics Managers
- IT Directors
- Transportation Directors

### 🏗️ Construction Services
- Project Management Platform
- Safety Compliance Monitoring
- Worker Management
- Resource Allocation
- Progress Reporting
- Safety Incident Reporting

**Target Companies:**
- General contractors (50-500 employees)
- Construction management companies
- Commercial construction firms

**Target Contacts:**
- Project Managers
- Safety Officers
- Operations Managers
- Construction Managers
- General Managers

## Using Explorium MCP in Cursor

### Step 1: Configure Explorium MCP

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

### Step 2: Query for Companies

Use Cursor's AI to query Explorium:

**Example Queries:**

1. **Healthcare:**
   ```
   Find healthcare companies with 50-500 employees that use EHR systems 
   and need patient communication solutions. Get their firmographics and 
   find IT directors or operations managers at these companies.
   ```

2. **Fleet Management:**
   ```
   Search for fleet management companies in the US with 100+ vehicles 
   that need real-time tracking and route optimization. Find fleet 
   managers and operations directors.
   ```

3. **Construction:**
   ```
   Find construction companies with 50-500 employees that need project 
   management and safety compliance software. Get contacts for project 
   managers and safety officers.
   ```

### Step 3: Process Results

The Explorium MCP server will return:
- Company data (name, domain, industry, size, location)
- Enriched firmographics (employees, revenue, technologies)
- Contact information (names, titles, emails, phones)
- Business intelligence (growth signals, events)

### Step 4: Generate Leads

Use the `exploriumLeadGenerator.ts` script to:
1. Process Explorium results
2. Match companies to TETRIX services
3. Calculate match scores
4. Save leads to JSON files

## Lead Generation Workflow

1. **Search Companies** - Use Explorium to find companies by industry, size, location
2. **Enrich Data** - Get firmographics, technographics, business intelligence
3. **Find Contacts** - Discover decision makers with relevant titles
4. **Match Services** - Map company needs to TETRIX offerings
5. **Score Leads** - Calculate relevance/match scores
6. **Export Leads** - Save to JSON for campaign import

## Example Lead Structure

```json
{
  "companyName": "ABC Medical Group",
  "domain": "abcmedical.com",
  "industry": "healthcare",
  "companySize": "201-500",
  "location": "San Francisco, CA, USA",
  "employees": 350,
  "revenue": "$10M-$50M",
  "technologies": ["Epic EHR", "Patient Portal"],
  "contacts": [
    {
      "name": "John Smith",
      "title": "IT Director",
      "email": "john.smith@abcmedical.com",
      "phone": "+1-555-123-4567",
      "linkedin": "https://linkedin.com/in/johnsmith"
    }
  ],
  "servicesNeeded": [
    "AI Voice Agents for healthcare communications",
    "EHR/EMR system integration",
    "HIPAA-compliant communication platform"
  ],
  "matchScore": 85,
  "source": "explorium"
}
```

## Integration with Campaign System

Generated leads can be imported into the TETRIX campaign system:

```typescript
import { ExploriumLeadGenerator } from './exploriumLeadGenerator';
import { CampaignManager } from './api/CampaignManager';

// Generate leads
const generator = new ExploriumLeadGenerator();
const healthcareLeads = await generator.generateHealthcareLeads(50);

// Import to campaign system
const campaignManager = new CampaignManager();
for (const lead of healthcareLeads) {
  if (lead.contacts && lead.contacts.length > 0) {
    const contact = lead.contacts[0];
    await campaignManager.addLead({
      email: contact.email,
      phoneNumber: contact.phone,
      firstName: contact.name.split(' ')[0],
      lastName: contact.name.split(' ').slice(1).join(' '),
      company: lead.companyName,
      industry: lead.industry,
      source: 'explorium',
      customFields: {
        companySize: lead.companySize,
        matchScore: lead.matchScore,
        servicesNeeded: lead.servicesNeeded.join(', ')
      }
    });
  }
}
```

## Best Practices

1. **Targeting**: Focus on companies with 50-500 employees (sweet spot for TETRIX services)
2. **Enrichment**: Always enrich company data before generating leads
3. **Contacts**: Prioritize decision makers (directors, managers, VPs)
4. **Scoring**: Use match scores to prioritize outreach
5. **Validation**: Verify email addresses and phone numbers before campaigns
6. **Segmentation**: Group leads by industry and service needs for targeted campaigns

## Next Steps

1. Configure Explorium MCP in Cursor
2. Generate leads for each industry
3. Review and validate leads
4. Import into campaign system
5. Create targeted email/SMS campaigns
6. Track conversion and optimize

## Support

- Explorium MCP Documentation: https://developers.explorium.ai/reference/agentsource-mcp
- Explorium Support: support@explorium.ai
- TETRIX Campaign System: See `README.md` in campaign directory


