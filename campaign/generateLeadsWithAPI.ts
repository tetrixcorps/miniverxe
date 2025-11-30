/**
 * TETRIX Lead Generation using Explorium API
 * 
 * This script generates B2B leads by calling the Explorium API directly
 * using the configured API key.
 */

import * as dotenv from 'dotenv';
import axios from 'axios';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

dotenv.config();

const EXPLORIUM_API_KEY = process.env['EXPLORIUM_API_KEY'] || process.env['EXPLORIUM_ACCESS_TOKEN'] || '';
const EXPLORIUM_API_BASE = 'https://api.explorium.ai';

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
 * Search for companies using Explorium API
 */
async function searchCompanies(query: string, filters: any = {}): Promise<any[]> {
  try {
    // Note: This is a placeholder - actual Explorium API endpoint structure may vary
    // Check Explorium API documentation for exact endpoint and parameters
    const response = await axios.post(
      `${EXPLORIUM_API_BASE}/v1/companies/search`,
      {
        query,
        ...filters
      },
      {
        headers: {
          'Authorization': `Bearer ${EXPLORIUM_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.companies || response.data.results || [];
  } catch (error: any) {
    console.error(`Error searching companies: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return [];
  }
}

/**
 * Enrich company data
 */
async function enrichCompany(companyId: string): Promise<any> {
  try {
    const response = await axios.get(
      `${EXPLORIUM_API_BASE}/v1/companies/${companyId}/enrich`,
      {
        headers: {
          'Authorization': `Bearer ${EXPLORIUM_API_KEY}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error(`Error enriching company: ${error.message}`);
    return null;
  }
}

/**
 * Find contacts at a company
 */
async function findContacts(companyId: string, roles: string[] = []): Promise<any[]> {
  try {
    const response = await axios.post(
      `${EXPLORIUM_API_BASE}/v1/companies/${companyId}/contacts`,
      {
        roles,
        limit: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${EXPLORIUM_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.contacts || response.data.results || [];
  } catch (error: any) {
    console.error(`Error finding contacts: ${error.message}`);
    return [];
  }
}

/**
 * Match company to TETRIX services
 */
function matchServices(company: any, industry: string): string[] {
  const services = TETRIX_SERVICES[industry as keyof typeof TETRIX_SERVICES] || [];
  const matched: string[] = [];
  
  const description = (company.description || '').toLowerCase();
  const technologies = (company.technologies || []).map((t: string) => t.toLowerCase());
  
  if (industry === 'healthcare') {
    if (description.includes('ehr') || description.includes('emr') || 
        technologies.some((t: string) => t.includes('ehr') || t.includes('emr'))) {
      matched.push('EHR/EMR system integration');
    }
    if (description.includes('patient') || description.includes('communication')) {
      matched.push('Patient Communication workflows');
      matched.push('AI Voice Agents for healthcare communications');
    }
    if (matched.length === 0) {
      matched.push(...services);
    }
  } else if (industry === 'logistics') {
    if (description.includes('fleet') || description.includes('vehicle')) {
      matched.push('Real-time Fleet Tracking');
      matched.push('eSIM for vehicle connectivity');
    }
    if (description.includes('route')) {
      matched.push('Route Optimization');
    }
    if (matched.length === 0) {
      matched.push(...services);
    }
  } else if (industry === 'construction') {
    if (description.includes('project') || description.includes('management')) {
      matched.push('Project Management Platform');
    }
    if (description.includes('safety')) {
      matched.push('Safety Compliance Monitoring');
    }
    if (matched.length === 0) {
      matched.push(...services);
    }
  }
  
  return matched.length > 0 ? matched : services;
}

/**
 * Calculate match score
 */
function calculateMatchScore(company: any, contacts: any[]): number {
  let score = 0;
  if (company.name) score += 10;
  if (company.domain || company.website) score += 10;
  if (company.employees) score += 10;
  if (company.location) score += 10;
  if (contacts.length > 0) score += 20;
  if (contacts.some((c: any) => c.email)) score += 10;
  if (contacts.some((c: any) => c.phone)) score += 10;
  if (company.industry) score += 10;
  if (company.description || company.technologies) score += 10;
  return Math.min(100, score);
}

/**
 * Generate leads for an industry
 */
async function generateLeadsForIndustry(
  industry: 'healthcare' | 'logistics' | 'construction',
  count: number = 20
): Promise<TETRIXLead[]> {
  const leads: TETRIXLead[] = [];
  
  console.log(`\n🔍 Generating ${count} leads for ${industry}...`);
  
  // Define search queries based on industry
  const queries = {
    healthcare: [
      'healthcare providers EHR systems',
      'medical practices patient communication',
      'hospitals benefit verification',
      'health systems prior authorization'
    ],
    logistics: [
      'fleet management companies vehicle tracking',
      'logistics companies route optimization',
      'trucking companies fleet operations',
      'delivery services vehicle management'
    ],
    construction: [
      'general contractors project management',
      'construction companies safety compliance',
      'commercial construction worker management',
      'construction firms resource allocation'
    ]
  };
  
  const targetRoles = {
    healthcare: ['IT Director', 'Operations Manager', 'Practice Manager'],
    logistics: ['Fleet Manager', 'Operations Manager', 'Logistics Manager'],
    construction: ['Project Manager', 'Safety Officer', 'Operations Manager']
  };
  
  const industryQueries = queries[industry];
  const roles = targetRoles[industry];
  
  for (const query of industryQueries) {
    if (leads.length >= count) break;
    
    console.log(`  Searching: ${query}...`);
    
    try {
      // Search for companies
      const companies = await searchCompanies(query, {
        industry: industry === 'healthcare' ? 'Healthcare' : industry === 'logistics' ? 'Transportation' : 'Construction',
        employees_min: 50,
        employees_max: 500,
        limit: Math.ceil((count - leads.length) / industryQueries.length)
      });
      
      for (const company of companies) {
        if (leads.length >= count) break;
        
        // Enrich company data
        let enrichedCompany = company;
        if (company.id) {
          const enriched = await enrichCompany(company.id);
          if (enriched) {
            enrichedCompany = { ...company, ...enriched };
          }
        }
        
        // Find contacts
        const contacts = company.id ? await findContacts(company.id, roles) : [];
        
        // Create lead
        const services = matchServices(enrichedCompany, industry);
        const matchScore = calculateMatchScore(enrichedCompany, contacts);
        
        const lead: TETRIXLead = {
          company: {
            name: enrichedCompany.name || company.name,
            domain: enrichedCompany.domain || company.domain,
            website: enrichedCompany.website || enrichedCompany.domain,
            industry: enrichedCompany.industry || industry,
            companySize: enrichedCompany.employees 
              ? enrichedCompany.employees < 50 ? '1-50' 
                : enrichedCompany.employees < 200 ? '51-200'
                : enrichedCompany.employees < 500 ? '201-500' : '500+'
              : undefined,
            employees: enrichedCompany.employees || company.employees,
            revenue: enrichedCompany.revenue,
            location: enrichedCompany.location || company.location || {},
            description: enrichedCompany.description || company.description,
            technologies: enrichedCompany.technologies || company.technologies
          },
          contacts: contacts.map((c: any) => ({
            name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim(),
            title: c.title || c.job_title,
            email: c.email,
            phone: c.phone || c.phone_number,
            linkedin: c.linkedin_url,
            department: c.department
          })),
          tetrixServices: services,
          matchScore,
          generatedAt: new Date().toISOString()
        };
        
        leads.push(lead);
        console.log(`  ✓ Found: ${lead.company.name} (${contacts.length} contacts, score: ${matchScore})`);
      }
    } catch (error: any) {
      console.error(`  ✗ Error processing query "${query}": ${error.message}`);
    }
  }
  
  return leads;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 TETRIX Lead Generation System');
  console.log('Using Explorium API for B2B Lead Generation\n');
  console.log('='.repeat(60));
  
  if (!EXPLORIUM_API_KEY) {
    console.error('❌ Error: EXPLORIUM_API_KEY not found in .env file');
    process.exit(1);
  }
  
  console.log('✅ Explorium API key configured\n');
  
  const outputDir = join(process.cwd(), 'leads');
  mkdirSync(outputDir, { recursive: true });
  
  const industries: Array<'healthcare' | 'logistics' | 'construction'> = 
    ['healthcare', 'logistics', 'construction'];
  
  const allLeads: { [key: string]: TETRIXLead[] } = {};
  
  for (const industry of industries) {
    try {
      const leads = await generateLeadsForIndustry(industry, 20);
      allLeads[industry] = leads;
      
      if (leads.length > 0) {
        const timestamp = Date.now();
        const filename = `${industry}-leads-${timestamp}.json`;
        writeFileSync(join(outputDir, filename), JSON.stringify(leads, null, 2));
        console.log(`\n✅ Saved ${leads.length} ${industry} leads to ${filename}`);
      }
    } catch (error: any) {
      console.error(`\n❌ Error generating ${industry} leads: ${error.message}`);
    }
  }
  
  // Generate summary
  const totalLeads = Object.values(allLeads).reduce((sum, leads) => sum + leads.length, 0);
  const summary = {
    generatedAt: new Date().toISOString(),
    totalLeads,
    byIndustry: {
      healthcare: allLeads.healthcare?.length || 0,
      logistics: allLeads.logistics?.length || 0,
      construction: allLeads.construction?.length || 0
    },
    results: industries.map(industry => ({
      industry,
      count: allLeads[industry]?.length || 0,
      leads: allLeads[industry] || []
    }))
  };
  
  const summaryFile = join(outputDir, `lead-generation-summary-${Date.now()}.json`);
  writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Lead Generation Report');
  console.log('='.repeat(60));
  console.log(`Total Leads Generated: ${totalLeads}`);
  console.log(`  Healthcare: ${allLeads.healthcare?.length || 0}`);
  console.log(`  Fleet/Logistics: ${allLeads.logistics?.length || 0}`);
  console.log(`  Construction: ${allLeads.construction?.length || 0}`);
  console.log(`\n✅ Results saved to: ${outputDir}`);
  console.log(`📄 Summary saved to: ${summaryFile}`);
}

if (require.main === module) {
  main().catch(console.error);
}

export { generateLeadsForIndustry, TETRIXLead };


