# TETRIX Lead Generation Implementation Summary

## ✅ Completed Setup

1. **Explorium MCP Server Installed**
   - Location: `/campaign/mcp-explorium/`
   - Dependencies: Installed
   - API Key: Configured in `.env`

2. **Lead Generation Scripts Created**
   - `generateTETRIXLeads.ts` - Main lead generation script
   - `exploriumLeadGenerator.ts` - Full-featured generator with API integration
   - `generateRealLeads.ts` - Template for MCP usage

3. **Documentation Created**
   - `EXPLORIUM-LEAD-GENERATION-GUIDE.md` - Comprehensive guide
   - `README-LEAD-GENERATION.md` - Quick reference
   - `README-MCP.md` - MCP server setup

## 🎯 TETRIX Services to Target

### Healthcare Services
- AI Voice Agents for healthcare communications
- Benefit Verification & Prior Authorization automation
- Prescription Follow-ups and medication management
- Patient Communication workflows
- EHR/EMR system integration
- HIPAA-compliant communication platform

**Target Companies:**
- Healthcare providers (50-500 employees)
- Medical practices using EHR/EMR
- Hospitals and health systems
- Clinics needing patient communication

**Target Contacts:**
- IT Directors
- Operations Managers
- Practice Managers
- Chief Medical Officers
- Healthcare Administrators

### Fleet Management Services
- Real-time Fleet Tracking
- Predictive Maintenance with AI
- Driver Behavior Analytics
- Route Optimization
- Telemetry Data collection
- eSIM for vehicle connectivity

**Target Companies:**
- Fleet management companies (100-500 vehicles)
- Logistics and transportation companies
- Trucking companies
- Delivery services

**Target Contacts:**
- Fleet Managers
- Operations Managers
- Logistics Managers
- IT Directors
- Transportation Directors

### Construction Services
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

## 📋 How to Generate Leads Using Explorium MCP

### Step 1: Configure Explorium MCP in Cursor

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

### Step 2: Use Cursor AI to Query Explorium

**Example Queries for Healthcare:**

1. "Find healthcare companies with 50-500 employees that use Epic or Cerner EHR systems and need patient communication solutions. Get their firmographics and find IT directors or operations managers at these companies."

2. "Search for medical practices with 100-300 employees that need HIPAA-compliant communication platforms. Enrich the company data and find practice managers with their contact information."

3. "Find hospitals and health systems with 200-500 employees using patient portals that need benefit verification automation. Get contacts for healthcare administrators and IT directors."

**Example Queries for Fleet Management:**

1. "Find fleet management companies with 100-500 vehicles that need real-time tracking and route optimization. Get fleet managers and operations directors with their emails and phone numbers."

2. "Search for logistics companies with 50-500 employees that need predictive maintenance and driver behavior analytics. Enrich the company data and find decision makers."

3. "Find trucking companies with 50-200 vehicles that need eSIM connectivity and telematics solutions. Get contacts for fleet managers and IT directors."

**Example Queries for Construction:**

1. "Find general contractors with 50-500 employees that need project management software and safety compliance monitoring. Get project managers and safety officers with contact information."

2. "Search for construction companies with 100-300 employees that need worker management and resource allocation tools. Enrich the data and find operations managers."

3. "Find commercial construction firms with 200-500 employees that need progress reporting and safety incident tracking. Get contacts for project managers and safety officers."

### Step 3: Process Results

Once you have the Explorium results, use the `generateTETRIXLeads.ts` script to:
1. Process company data
2. Match to TETRIX services
3. Calculate match scores
4. Save to JSON files

### Step 4: Import to Campaign System

Use the generated JSON files to import leads into the campaign system for email/SMS outreach.

## 📊 Expected Lead Structure

Each lead should include:
- Company information (name, domain, industry, size, location)
- Enriched data (employees, revenue, technologies)
- Contacts (decision makers with titles, emails, phones)
- Services needed (matched to TETRIX offerings)
- Match score (relevance rating 0-100)

## 🚀 Next Steps

1. **Configure MCP in Cursor** - Add Explorium to `~/.cursor/mcp.json`
2. **Generate Leads** - Use Cursor AI to query Explorium for each industry
3. **Process Results** - Use the scripts to format and save leads
4. **Import to Campaigns** - Add leads to the campaign system
5. **Create Campaigns** - Set up targeted email/SMS campaigns
6. **Track Results** - Monitor conversion and optimize

## 📁 Files Created

- `generateTETRIXLeads.ts` - Main lead generation script
- `exploriumLeadGenerator.ts` - Full API integration
- `generateRealLeads.ts` - MCP usage template
- `EXPLORIUM-LEAD-GENERATION-GUIDE.md` - Detailed guide
- `README-LEAD-GENERATION.md` - Quick reference
- `mcp-config.json` - MCP configuration
- `leads/` - Directory for generated lead files

## 💡 Tips

- Start with 20-50 leads per industry for testing
- Focus on companies with 50-500 employees (sweet spot)
- Prioritize leads with contact emails and phone numbers
- Use match scores to prioritize outreach
- Segment leads by industry and service needs
- Validate email addresses before campaigns


