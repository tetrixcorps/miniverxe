// Shared session storage for JoRoMi API endpoints
// In production, replace with Redis or database

export const joromiSessions = new Map<string, any>();

// JoRoMi agents configuration
export const JOROMI_AGENTS = [
  {
    id: 'joromi-general',
    name: 'JoRoMi General Assistant',
    description: 'General purpose AI assistant for enterprise inquiries',
    greeting: 'Hello! I\'m JoRoMi, your AI Super Agent. I\'m here to help you with enterprise inquiries, technical support, and solution recommendations. How can I assist you today?'
  },
  {
    id: 'joromi-technical',
    name: 'JoRoMi Technical Support',
    description: 'Specialized technical support for TETRIX services',
    greeting: 'Hi! I\'m JoRoMi Technical Support. I can help you with technical issues, troubleshooting, and system optimization. What technical challenge can I help you solve?'
  },
  {
    id: 'joromi-sales',
    name: 'JoRoMi Sales Assistant',
    description: 'Sales and pricing information specialist',
    greeting: 'Welcome! I\'m JoRoMi Sales Assistant. I can provide detailed information about our enterprise solutions, pricing, and help you find the perfect plan for your business needs.'
  }
];

