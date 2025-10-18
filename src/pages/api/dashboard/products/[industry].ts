import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { industry } = params;
    
    if (!industry) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Industry parameter required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Mock products for now - in production this would come from a database
    const products = {
      healthcare: [
        {
          id: 'healthcare-trial',
          name: 'Healthcare Communication Platform',
          description: '7-day free trial with full access to patient communication, appointment scheduling, and EHR integration',
          category: 'subscription',
          industry: 'healthcare',
          price: 0,
          currency: 'USD',
          billingCycle: 'monthly',
          required: true,
          trialEligible: true,
          features: [
            'Patient communication',
            'Appointment scheduling',
            'EHR integration',
            'Emergency triage',
            'HIPAA compliance'
          ],
          metadata: {
            trialDays: 7,
            requiresPayment: false,
            autoActivate: true
          }
        }
      ],
      construction: [
        {
          id: 'construction-trial',
          name: 'Construction Management Platform',
          description: '7-day free trial with project management, safety alerts, and resource optimization',
          category: 'subscription',
          industry: 'construction',
          price: 0,
          currency: 'USD',
          billingCycle: 'monthly',
          required: true,
          trialEligible: true,
          features: [
            'Project management',
            'Safety compliance',
            'Resource optimization',
            'Team collaboration',
            'Real-time reporting'
          ],
          metadata: {
            trialDays: 7,
            requiresPayment: false,
            autoActivate: true
          }
        }
      ],
      logistics: [
        {
          id: 'logistics-trial',
          name: 'Fleet Management Platform',
          description: '7-day free trial with vehicle tracking, driver management, and route optimization',
          category: 'subscription',
          industry: 'logistics',
          price: 0,
          currency: 'USD',
          billingCycle: 'monthly',
          required: true,
          trialEligible: true,
          features: [
            'Vehicle tracking',
            'Driver management',
            'Route optimization',
            'Delivery management',
            'Analytics dashboard'
          ],
          metadata: {
            trialDays: 7,
            requiresPayment: false,
            autoActivate: true
          }
        },
        {
          id: 'esim-fleet-basic',
          name: 'Fleet eSIM - Basic',
          description: 'eSIM for fleet vehicles with basic connectivity and tracking',
          category: 'esim',
          industry: 'logistics',
          price: 25,
          currency: 'USD',
          billingCycle: 'monthly',
          required: true,
          trialEligible: false,
          features: [
            'Global connectivity',
            'Real-time tracking',
            'Data monitoring',
            'Device management'
          ],
          metadata: {
            dataLimit: '5GB',
            coverage: 'global',
            deviceType: 'vehicle'
          }
        },
        {
          id: 'contact-management-basic',
          name: 'Contact Management - Basic',
          description: 'Basic contact management for driver and vehicle information',
          category: 'addon',
          industry: 'logistics',
          price: 15,
          currency: 'USD',
          billingCycle: 'monthly',
          required: true,
          trialEligible: false,
          features: [
            'Driver profiles',
            'Vehicle information',
            'Basic reporting',
            'Data export'
          ],
          metadata: {
            maxContacts: 100,
            maxVehicles: 50
          }
        }
      ]
    };

    const industryProducts = products[industry as keyof typeof products] || [];

    return new Response(JSON.stringify({
      success: true,
      products: industryProducts
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error getting products:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};