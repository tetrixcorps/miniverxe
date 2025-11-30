/**
 * TETRIX Lead Generation System using Explorium
 * Generates B2B leads for TETRIX services using Explorium Business Data Hub
 * 
 * This script uses Explorium API to:
 * 1. Search for companies by industry and keywords
 * 2. Enrich company data with firmographics and technographics
 * 3. Find decision makers and contacts
 * 4. Match companies to TETRIX services
 */

import * as dotenv from 'dotenv';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

dotenv.config();

interface Company {
  id?: string;
  name: string;
  domain?: string;
  industry: string;
  companySize?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  description?: string;
  website?: string;
  employees?: number;
  revenue?: string;
  technologies?: string[];
  contacts?: Contact[];
  servicesNeeded: string[];
  matchScore?: number;
}

interface Contact {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  department?: string;
}

interface LeadGenerationResult {
  industry: string;
  totalCompanies: number;
  enrichedCompanies: number;
  contactsFound: number;
  leads: Company[];
  generatedAt: string;
}

class ExploriumLeadGenerator {
  private apiKey: string;
  private apiBaseUrl = 'https://api.explorium.ai/v1';
  private outputDir: string;
  private leads: Company[] = [];

  constructor() {
    this.apiKey = process.env.EXPLORIUM_API_KEY || process.env.EXPLORIUM_ACCESS_TOKEN || '';
    if (!this.apiKey) {
      throw new Error('EXPLORIUM_API_KEY or EXPLORIUM_ACCESS_TOKEN must be set in .env file');
    }
    
    this.outputDir = join(process.cwd(), 'leads');
    mkdirSync(this.outputDir, { recursive: true });
  }

  /**
   * Search for companies using Explorium API
   */
  async searchCompanies(query: string, filters: {
    industry?: string;
    companySize?: string[];
    location?: string;
    limit?: number;
  }): Promise<any[]> {
    try {
      // Note: This is a template for Explorium API integration
      // Actual API endpoints may vary - check Explorium API documentation
      const response = await axios.post(
        `${this.apiBaseUrl}/companies/search`,
        {
          query: query,
          filters: {
            industry: filters.industry,
            company_size: filters.companySize,
            location: filters.location
          },
          limit: filters.limit || 50
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.companies || response.data.results || [];
    } catch (error: any) {
      console.error(`❌ Error searching companies:`, error.message);
      // Return mock data for development/testing
      return this.getMockCompanies(query, filters);
    }
  }

  /**
   * Enrich company data
   */
  async enrichCompany(companyId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/companies/${companyId}/enrich`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(`❌ Error enriching company ${companyId}:`, error.message);
      return {};
    }
  }

  /**
   * Find contacts within a company
   */
  async findContacts(companyId: string, roles: string[] = []): Promise<Contact[]> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/companies/${companyId}/contacts`,
        {
          params: {
            roles: roles.join(','),
            limit: 10
          },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return (response.data.contacts || response.data.results || []).map((c: any) => ({
        name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim(),
        title: c.title || c.job_title,
        email: c.email,
        phone: c.phone,
        linkedin: c.linkedin_url,
        department: c.department
      }));
    } catch (error: any) {
      console.error(`❌ Error finding contacts for ${companyId}:`, error.message);
      return [];
    }
  }

  /**
   * Generate leads for healthcare industry
   */
  async generateHealthcareLeads(count: number = 50): Promise<Company[]> {
    console.log('\n🏥 Generating Healthcare Leads...');
    
    const keywords = [
      'healthcare provider',
      'medical practice',
      'hospital',
      'clinic',
      'health system'
    ];

    const leads: Company[] = [];

    for (const keyword of keywords) {
      const companies = await this.searchCompanies(keyword, {
        industry: 'healthcare',
        companySize: ['51-200', '201-500', '501-1000', '1001-5000', '5001-10000'],
        limit: Math.ceil(count / keywords.length)
      });

      for (const company of companies) {
        const enriched = await this.enrichCompany(company.id || company.company_id);
        
        // Find decision makers (IT directors, operations managers, practice managers)
        const contacts = await this.findContacts(company.id || company.company_id, [
          'IT Director',
          'Operations Manager',
          'Practice Manager',
          'Chief Medical Officer',
          'Healthcare Administrator'
        ]);

        leads.push({
          id: company.id || company.company_id,
          name: company.name || company.company_name,
          domain: company.domain || company.website,
          industry: 'healthcare',
          companySize: enriched.company_size || company.company_size,
          location: {
            city: enriched.city || company.city,
            state: enriched.state || company.state,
            country: enriched.country || company.country || 'USA'
          },
          description: enriched.description || company.description,
          website: company.website || company.domain,
          employees: enriched.employees || company.employees,
          revenue: enriched.revenue || company.revenue,
          technologies: enriched.technologies || [],
          contacts: contacts,
          servicesNeeded: [
            'AI Voice Agents for healthcare communications',
            'Benefit Verification & Prior Authorization automation',
            'EHR/EMR system integration',
            'HIPAA-compliant communication platform'
          ],
          matchScore: this.calculateMatchScore(company, 'healthcare')
        });

        if (leads.length >= count) break;
      }

      if (leads.length >= count) break;
    }

    return leads.slice(0, count);
  }

  /**
   * Generate leads for fleet/logistics industry
   */
  async generateFleetLeads(count: number = 50): Promise<Company[]> {
    console.log('\n🚛 Generating Fleet Management Leads...');
    
    const keywords = [
      'fleet management',
      'logistics',
      'transportation',
      'trucking',
      'delivery services'
    ];

    const leads: Company[] = [];

    for (const keyword of keywords) {
      const companies = await this.searchCompanies(keyword, {
        industry: 'transportation',
        companySize: ['51-200', '201-500', '501-1000', '1001-5000'],
        limit: Math.ceil(count / keywords.length)
      });

      for (const company of companies) {
        const enriched = await this.enrichCompany(company.id || company.company_id);
        
        // Find fleet managers, operations managers, IT directors
        const contacts = await this.findContacts(company.id || company.company_id, [
          'Fleet Manager',
          'Operations Manager',
          'Logistics Manager',
          'IT Director',
          'Transportation Director'
        ]);

        leads.push({
          id: company.id || company.company_id,
          name: company.name || company.company_name,
          domain: company.domain || company.website,
          industry: 'logistics',
          companySize: enriched.company_size || company.company_size,
          location: {
            city: enriched.city || company.city,
            state: enriched.state || company.state,
            country: enriched.country || company.country || 'USA'
          },
          description: enriched.description || company.description,
          website: company.website || company.domain,
          employees: enriched.employees || company.employees,
          revenue: enriched.revenue || company.revenue,
          technologies: enriched.technologies || [],
          contacts: contacts,
          servicesNeeded: [
            'Real-time Fleet Tracking',
            'Predictive Maintenance with AI',
            'Route Optimization',
            'eSIM for vehicle connectivity',
            'Driver Behavior Analytics'
          ],
          matchScore: this.calculateMatchScore(company, 'logistics')
        });

        if (leads.length >= count) break;
      }

      if (leads.length >= count) break;
    }

    return leads.slice(0, count);
  }

  /**
   * Generate leads for construction industry
   */
  async generateConstructionLeads(count: number = 50): Promise<Company[]> {
    console.log('\n🏗️ Generating Construction Leads...');
    
    const keywords = [
      'general contractor',
      'construction management',
      'commercial construction',
      'construction services'
    ];

    const leads: Company[] = [];

    for (const keyword of keywords) {
      const companies = await this.searchCompanies(keyword, {
        industry: 'construction',
        companySize: ['51-200', '201-500', '501-1000', '1001-5000'],
        limit: Math.ceil(count / keywords.length)
      });

      for (const company of companies) {
        const enriched = await this.enrichCompany(company.id || company.company_id);
        
        // Find project managers, safety officers, operations managers
        const contacts = await this.findContacts(company.id || company.company_id, [
          'Project Manager',
          'Safety Officer',
          'Operations Manager',
          'Construction Manager',
          'General Manager'
        ]);

        leads.push({
          id: company.id || company.company_id,
          name: company.name || company.company_name,
          domain: company.domain || company.website,
          industry: 'construction',
          companySize: enriched.company_size || company.company_size,
          location: {
            city: enriched.city || company.city,
            state: enriched.state || company.state,
            country: enriched.country || company.country || 'USA'
          },
          description: enriched.description || company.description,
          website: company.website || company.domain,
          employees: enriched.employees || company.employees,
          revenue: enriched.revenue || company.revenue,
          technologies: enriched.technologies || [],
          contacts: contacts,
          servicesNeeded: [
            'Project Management Platform',
            'Safety Compliance Monitoring',
            'Worker Management',
            'Resource Allocation',
            'Progress Reporting'
          ],
          matchScore: this.calculateMatchScore(company, 'construction')
        });

        if (leads.length >= count) break;
      }

      if (leads.length >= count) break;
    }

    return leads.slice(0, count);
  }

  /**
   * Calculate match score for a company
   */
  private calculateMatchScore(company: any, industry: string): number {
    let score = 50; // Base score

    // Size scoring
    if (company.employees) {
      if (company.employees >= 50 && company.employees <= 5000) score += 20;
      if (company.employees >= 5000) score += 10;
    }

    // Industry match
    if (company.industry?.toLowerCase().includes(industry)) score += 20;

    // Has website/domain
    if (company.website || company.domain) score += 10;

    return Math.min(100, score);
  }

  /**
   * Get mock companies for testing (when API is unavailable)
   */
  private getMockCompanies(query: string, filters: any): any[] {
    // Return empty array - in production, this would be replaced with actual API calls
    return [];
  }

  /**
   * Save leads to JSON file
   */
  saveLeads(leads: Company[], filename: string): void {
    const filepath = join(this.outputDir, filename);
    writeFileSync(filepath, JSON.stringify(leads, null, 2));
    console.log(`✅ Saved ${leads.length} leads to ${filepath}`);
  }

  /**
   * Generate comprehensive lead report
   */
  generateReport(results: LeadGenerationResult[]): void {
    console.log('\n📊 TETRIX Lead Generation Report');
    console.log('='.repeat(60));
    
    let totalCompanies = 0;
    let totalEnriched = 0;
    let totalContacts = 0;

    results.forEach(result => {
      console.log(`\n${result.industry.toUpperCase()} Industry:`);
      console.log(`  Companies Found: ${result.totalCompanies}`);
      console.log(`  Enriched: ${result.enrichedCompanies}`);
      console.log(`  Contacts Found: ${result.contactsFound}`);
      console.log(`  Qualified Leads: ${result.leads.length}`);
      
      totalCompanies += result.totalCompanies;
      totalEnriched += result.enrichedCompanies;
      totalContacts += result.contactsFound;
    });

    console.log('\n' + '='.repeat(60));
    console.log(`TOTAL COMPANIES: ${totalCompanies}`);
    console.log(`TOTAL ENRICHED: ${totalEnriched}`);
    console.log(`TOTAL CONTACTS: ${totalContacts}`);
    console.log(`TOTAL QUALIFIED LEADS: ${results.reduce((sum, r) => sum + r.leads.length, 0)}`);
  }
}

// Main execution function
async function main() {
  console.log('🚀 TETRIX Lead Generation System');
  console.log('Using Explorium Business Data Hub\n');

  const generator = new ExploriumLeadGenerator();
  const results: LeadGenerationResult[] = [];

  try {
    // Generate healthcare leads
    const healthcareLeads = await generator.generateHealthcareLeads(50);
    results.push({
      industry: 'healthcare',
      totalCompanies: healthcareLeads.length,
      enrichedCompanies: healthcareLeads.filter(l => l.employees).length,
      contactsFound: healthcareLeads.reduce((sum, l) => sum + (l.contacts?.length || 0), 0),
      leads: healthcareLeads,
      generatedAt: new Date().toISOString()
    });
    generator.saveLeads(healthcareLeads, `healthcare-leads-${Date.now()}.json`);

    // Generate fleet/logistics leads
    const fleetLeads = await generator.generateFleetLeads(50);
    results.push({
      industry: 'logistics',
      totalCompanies: fleetLeads.length,
      enrichedCompanies: fleetLeads.filter(l => l.employees).length,
      contactsFound: fleetLeads.reduce((sum, l) => sum + (l.contacts?.length || 0), 0),
      leads: fleetLeads,
      generatedAt: new Date().toISOString()
    });
    generator.saveLeads(fleetLeads, `fleet-leads-${Date.now()}.json`);

    // Generate construction leads
    const constructionLeads = await generator.generateConstructionLeads(50);
    results.push({
      industry: 'construction',
      totalCompanies: constructionLeads.length,
      enrichedCompanies: constructionLeads.filter(l => l.employees).length,
      contactsFound: constructionLeads.reduce((sum, l) => sum + (l.contacts?.length || 0), 0),
      leads: constructionLeads,
      generatedAt: new Date().toISOString()
    });
    generator.saveLeads(constructionLeads, `construction-leads-${Date.now()}.json`);

    // Generate comprehensive report
    generator.generateReport(results);

    // Save summary report
    const summaryPath = join(generator['outputDir'], `lead-generation-summary-${Date.now()}.json`);
    writeFileSync(summaryPath, JSON.stringify(results, null, 2));
    console.log(`\n✅ Summary report saved to ${summaryPath}`);

  } catch (error: any) {
    console.error('❌ Error generating leads:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { ExploriumLeadGenerator, Company, Contact, LeadGenerationResult };


