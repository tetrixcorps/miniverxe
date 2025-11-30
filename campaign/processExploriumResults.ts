/**
 * Process Explorium MCP Results into TETRIX Lead Format
 * 
 * This script processes JSON results from Explorium MCP queries
 * and formats them into the TETRIX lead structure.
 * 
 * Usage:
 *   ts-node processExploriumResults.ts <input-file.json> [industry]
 * 
 * Example:
 *   ts-node processExploriumResults.ts healthcare-results.json healthcare
 */

import * as dotenv from 'dotenv';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

dotenv.config();

interface ExploriumCompany {
  name: string;
  domain?: string;
  website?: string;
  industry?: string;
  employees?: number;
  revenue?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  description?: string;
  technologies?: string[];
  [key: string]: any; // Allow additional fields
}

interface ExploriumContact {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  department?: string;
  [key: string]: any;
}

interface ExploriumResult {
  company?: ExploriumCompany;
  companies?: ExploriumCompany[];
  contacts?: ExploriumContact[];
  [key: string]: any;
}

interface TETRIXLead {
  company: {
    name: string;
    domain?: string;
    website?: string;
    industry: string;
    companySize?: string;
    employees?: number;
    revenue?: string;
    location: {
      city?: string;
      state?: string;
      country?: string;
    };
    description?: string;
    technologies?: string[];
  };
  contacts: Array<{
    name: string;
    title?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    department?: string;
  }>;
  tetrixServices: string[];
  matchScore: number;
  generatedAt: string;
}

// TETRIX Services by Industry
const TETRIX_SERVICES = {
  healthcare: [
    'AI Voice Agents for healthcare communications',
    'Benefit Verification & Prior Authorization automation',
    'Prescription Follow-ups and medication management',
    'Patient Communication workflows',
    'EHR/EMR system integration',
    'HIPAA-compliant communication platform'
  ],
  logistics: [
    'Real-time Fleet Tracking',
    'Predictive Maintenance with AI',
    'Driver Behavior Analytics',
    'Route Optimization',
    'Telemetry Data collection',
    'eSIM for vehicle connectivity'
  ],
  construction: [
    'Project Management Platform',
    'Safety Compliance Monitoring',
    'Worker Management',
    'Resource Allocation',
    'Progress Reporting',
    'Safety Incident Reporting'
  ]
};

/**
 * Match company to TETRIX services based on industry and keywords
 */
function matchServices(company: ExploriumCompany, industry: string): string[] {
  const services = TETRIX_SERVICES[industry as keyof typeof TETRIX_SERVICES] || [];
  const matched: string[] = [];
  
  // Simple keyword matching - can be enhanced
  const description = (company.description || '').toLowerCase();
  const technologies = (company.technologies || []).map(t => t.toLowerCase());
  
  // Healthcare matching
  if (industry === 'healthcare') {
    if (description.includes('ehr') || description.includes('emr') || 
        technologies.some(t => t.includes('ehr') || t.includes('emr'))) {
      matched.push('EHR/EMR system integration');
    }
    if (description.includes('patient') || description.includes('communication')) {
      matched.push('Patient Communication workflows');
      matched.push('AI Voice Agents for healthcare communications');
    }
    if (description.includes('benefit') || description.includes('authorization')) {
      matched.push('Benefit Verification & Prior Authorization automation');
    }
    // Default to all if no specific match
    if (matched.length === 0) {
      matched.push(...services);
    }
  }
  
  // Logistics matching
  if (industry === 'logistics') {
    if (description.includes('fleet') || description.includes('vehicle')) {
      matched.push('Real-time Fleet Tracking');
      matched.push('eSIM for vehicle connectivity');
    }
    if (description.includes('route') || description.includes('optimization')) {
      matched.push('Route Optimization');
    }
    if (description.includes('maintenance') || description.includes('predictive')) {
      matched.push('Predictive Maintenance with AI');
    }
    if (description.includes('driver') || description.includes('behavior')) {
      matched.push('Driver Behavior Analytics');
    }
    if (matched.length === 0) {
      matched.push(...services);
    }
  }
  
  // Construction matching
  if (industry === 'construction') {
    if (description.includes('project') || description.includes('management')) {
      matched.push('Project Management Platform');
    }
    if (description.includes('safety') || description.includes('compliance')) {
      matched.push('Safety Compliance Monitoring');
      matched.push('Safety Incident Reporting');
    }
    if (description.includes('worker') || description.includes('employee')) {
      matched.push('Worker Management');
    }
    if (description.includes('resource') || description.includes('allocation')) {
      matched.push('Resource Allocation');
    }
    if (matched.length === 0) {
      matched.push(...services);
    }
  }
  
  return matched.length > 0 ? matched : services;
}

/**
 * Calculate match score based on company data quality
 */
function calculateMatchScore(company: ExploriumCompany, contacts: ExploriumContact[]): number {
  let score = 0;
  
  // Company data completeness (40 points)
  if (company.name) score += 10;
  if (company.domain || company.website) score += 10;
  if (company.employees) score += 10;
  if (company.location) score += 10;
  
  // Contact data quality (40 points)
  if (contacts.length > 0) score += 20;
  if (contacts.some(c => c.email)) score += 10;
  if (contacts.some(c => c.phone)) score += 10;
  
  // Industry relevance (20 points)
  if (company.industry) score += 10;
  if (company.description || company.technologies) score += 10;
  
  return Math.min(100, score);
}

/**
 * Determine company size category
 */
function getCompanySize(employees?: number): string {
  if (!employees) return 'Unknown';
  if (employees < 10) return '1-10';
  if (employees < 50) return '11-50';
  if (employees < 200) return '51-200';
  if (employees < 500) return '201-500';
  if (employees < 1000) return '501-1000';
  return '1000+';
}

/**
 * Process Explorium results into TETRIX leads
 */
function processResults(data: ExploriumResult, industry: string): TETRIXLead[] {
  const leads: TETRIXLead[] = [];
  
  // Handle single company or array of companies
  const companies = data.companies || (data.company ? [data.company] : []);
  const contacts = data.contacts || [];
  
  for (const company of companies) {
    // Group contacts by company (if multiple companies)
    const companyContacts = contacts.filter((c: ExploriumContact) => {
      // Simple matching - can be enhanced
      if (company.domain) {
        return c.email?.includes(company.domain.split('.')[0]);
      }
      return true; // Include all contacts if no domain match
    });
    
    // If no contacts matched, use all contacts (assume they're for this company)
    const finalContacts = companyContacts.length > 0 ? companyContacts : contacts;
    
    const services = matchServices(company, industry);
    const matchScore = calculateMatchScore(company, finalContacts);
    
    const lead: TETRIXLead = {
      company: {
        name: company.name,
        domain: company.domain,
        website: company.website || company.domain,
        industry: company.industry || industry,
        companySize: getCompanySize(company.employees),
        employees: company.employees,
        revenue: company.revenue,
        location: company.location || {},
        description: company.description,
        technologies: company.technologies
      },
      contacts: finalContacts.map(c => ({
        name: c.name,
        title: c.title,
        email: c.email,
        phone: c.phone,
        linkedin: c.linkedin,
        department: c.department
      })),
      tetrixServices: services,
      matchScore,
      generatedAt: new Date().toISOString()
    };
    
    leads.push(lead);
  }
  
  return leads;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: ts-node processExploriumResults.ts <input-file.json> [industry]');
    console.error('');
    console.error('Example:');
    console.error('  ts-node processExploriumResults.ts healthcare-results.json healthcare');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const industry = args[1] || 'healthcare'; // Default to healthcare
  
  if (!['healthcare', 'logistics', 'construction'].includes(industry)) {
    console.error(`Invalid industry: ${industry}`);
    console.error('Valid industries: healthcare, logistics, construction');
    process.exit(1);
  }
  
  try {
    console.log(`📖 Reading ${inputFile}...`);
    const fileContent = readFileSync(inputFile, 'utf-8');
    const data = JSON.parse(fileContent);
    
    console.log(`🔄 Processing results for ${industry} industry...`);
    const leads = processResults(data, industry);
    
    if (leads.length === 0) {
      console.warn('⚠️  No leads generated. Check the input file format.');
      process.exit(1);
    }
    
    // Save results
    const outputDir = join(process.cwd(), 'leads');
    mkdirSync(outputDir, { recursive: true });
    
    const timestamp = Date.now();
    const outputFile = join(outputDir, `${industry}-leads-${timestamp}.json`);
    
    writeFileSync(outputFile, JSON.stringify(leads, null, 2));
    
    console.log(`\n✅ Successfully processed ${leads.length} leads`);
    console.log(`📁 Saved to: ${outputFile}`);
    console.log(`\n📊 Summary:`);
    console.log(`   Total Leads: ${leads.length}`);
    console.log(`   With Contacts: ${leads.filter(l => l.contacts.length > 0).length}`);
    console.log(`   With Email: ${leads.filter(l => l.contacts.some(c => c.email)).length}`);
    console.log(`   With Phone: ${leads.filter(l => l.contacts.some(c => c.phone)).length}`);
    console.log(`   Average Match Score: ${(leads.reduce((sum, l) => sum + l.matchScore, 0) / leads.length).toFixed(1)}`);
    
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    if (error.code === 'ENOENT') {
      console.error(`   File not found: ${inputFile}`);
    } else if (error instanceof SyntaxError) {
      console.error(`   Invalid JSON in file: ${inputFile}`);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { processResults, TETRIXLead, ExploriumResult };


