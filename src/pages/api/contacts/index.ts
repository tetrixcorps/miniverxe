import type { APIRoute } from 'astro';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  company?: string;
  industry: string;
  tags: string[];
  notes?: string;
  smsOptIn: boolean;
  emailOptIn: boolean;
  preferredContactTime?: string;
  timezone: string;
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
}

// Mock database - in production, this would be a real database
let contacts: Contact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '(555) 123-4567',
    email: 'john.doe@example.com',
    company: 'Acme Corp',
    industry: 'healthcare',
    tags: ['VIP', 'SMS Opt-in'],
    notes: 'Regular patient, prefers morning appointments',
    smsOptIn: true,
    emailOptIn: true,
    preferredContactTime: '9-17',
    timezone: 'UTC',
    customFields: {
      dateOfBirth: '1980-05-15',
      insuranceProvider: 'Blue Cross'
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    lastContactedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '(555) 987-6543',
    email: 'jane.smith@example.com',
    company: 'Smith & Associates',
    industry: 'legal',
    tags: ['New Customer', 'Email Opt-in'],
    notes: 'Personal injury case',
    smsOptIn: false,
    emailOptIn: true,
    preferredContactTime: '10-16',
    timezone: 'UTC',
    customFields: {
      caseType: 'personal-injury',
      caseStatus: 'active'
    },
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z'
  }
];

export const GET: APIRoute = async ({ request, url }) => {
  return handleGet(request, url);
};

export const POST: APIRoute = async ({ request }) => {
  return handlePost(request);
};

async function handleGet(
  request: Request,
  url: URL
): Promise<Response> {
  try {
    const searchParams = url.searchParams;
    const industry = searchParams.get('industry');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    let filteredContacts = [...contacts];

    // Filter by industry
    if (industry && industry !== 'all') {
      filteredContacts = filteredContacts.filter(contact => 
        contact.industry === industry
      );
    }

    // Filter by search term
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredContacts = filteredContacts.filter(contact =>
        contact.firstName.toLowerCase().includes(searchTerm) ||
        contact.lastName.toLowerCase().includes(searchTerm) ||
        contact.phoneNumber.includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm) ||
        contact.company?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by tags
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filteredContacts = filteredContacts.filter(contact =>
        tagArray.some(tag => contact.tags.includes(tag as string))
      );
    }

    // Apply pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const paginatedContacts = filteredContacts.slice(offsetNum, offsetNum + limitNum);

    return new Response(JSON.stringify({ contacts: paginatedContacts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch contacts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handlePost(
  request: Request
): Promise<Response> {
  try {
    const contactData = await request.json();

    // Validate required fields
    if (!contactData.firstName || !contactData.lastName || !contactData.phoneNumber) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create new contact
    const newContact: Contact = {
      id: Date.now().toString(),
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      phoneNumber: contactData.phoneNumber,
      email: contactData.email || '',
      company: contactData.company || '',
      industry: contactData.industry || 'general',
      tags: contactData.tags || [],
      notes: contactData.notes || '',
      smsOptIn: contactData.smsOptIn || false,
      emailOptIn: contactData.emailOptIn || false,
      preferredContactTime: contactData.preferredContactTime || '9-17',
      timezone: contactData.timezone || 'UTC',
      customFields: contactData.customFields || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock database
    contacts.push(newContact);

    return new Response(JSON.stringify(newContact), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    return new Response(JSON.stringify({ error: 'Failed to create contact' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
