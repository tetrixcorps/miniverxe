import type { APIRoute } from 'astro';
import { dashboardService } from '../../../../services/dashboardService';

// API endpoint for fetching dashboard metrics
// GET /api/v1/dashboard/metrics?industry=fleet&role=fleet_manager

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const industry = url.searchParams.get('industry') as 'fleet' | 'healthcare' | 'legal' || 'fleet';
    const role = url.searchParams.get('role') as 'fleet_manager' | 'healthcare_provider' | 'attorney' || 'fleet_manager';

    // Validate industry parameter
    const validIndustries = [
      'fleet', 
      'healthcare', 
      'legal', 
      'construction', 
      'education', 
      'government', 
      'retail', 
      'hospitality', 
      'wellness', 
      'beauty'
    ];
    if (!validIndustries.includes(industry)) {
      return new Response(JSON.stringify({
        success: false,
        error: `Invalid industry parameter. Must be one of: ${validIndustries.join(', ')}`
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Validate role parameter
    // We relax role validation to allow generic access if role isn't perfect, 
    // or we should expand this list too. For now, let's expand generic roles.
    const validRoles = [
      'fleet_manager', 
      'healthcare_provider', 
      'attorney',
      'project_manager',
      'admin',
      'manager',
      'user'
    ];
    if (!role && !validRoles.includes(role)) {
       // If strictly validating roles, we need to add all of them. 
       // For MVP, let's allow any string if it's not empty, or keep strict if preferred.
       // Let's expand the list to be safe but maybe less strict in the future.
    
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid role parameter. Must be one of: fleet_manager, healthcare_provider, attorney'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Fetch universal metrics
    const universalMetrics = await dashboardService.getUniversalMetrics();
    
    // Fetch industry-specific metrics
    const industryMetrics = await dashboardService.getIndustryMetrics(industry, role);

    // Combine metrics
    const response = {
      success: true,
      data: {
        universal: universalMetrics,
        industry: industryMetrics,
        metadata: {
          industry,
          role,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Dashboard metrics API error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch dashboard metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// POST endpoint for real-time updates subscription
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { industry, role, action } = body;

    if (action === 'subscribe') {
      // In a real implementation, this would set up WebSocket connections
      // For MVP, we'll just return a success response
      return new Response(JSON.stringify({
        success: true,
        message: 'Real-time updates subscription initiated',
        subscriptionId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    if (action === 'export') {
      const { format = 'json' } = body;
      const data = await dashboardService.exportDashboardData(industry, format);
      
      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': format === 'csv' ? 'text/csv' : 
                        format === 'pdf' ? 'application/pdf' : 
                        'application/json',
          'Content-Disposition': `attachment; filename="dashboard-export.${format}"`
        }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid action. Supported actions: subscribe, export'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Dashboard API POST error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
