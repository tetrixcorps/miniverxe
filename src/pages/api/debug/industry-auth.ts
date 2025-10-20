import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'status';

  try {
    switch (action) {
      case 'status':
        return new Response(JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          status: 'IndustryAuth Debug API is running',
          availableActions: ['status', 'test-phone', 'test-modal']
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });

      case 'test-phone':
        const phoneNumber = url.searchParams.get('phone') || '+15551234567';
        
        // Test phone number validation
        let cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
        if (cleanPhone.startsWith('++')) {
          cleanPhone = cleanPhone.substring(1);
        }
        if (!cleanPhone.startsWith('+')) {
          cleanPhone = '+' + cleanPhone;
        }
        
        const digits = cleanPhone.slice(1).replace(/\D/g, '');
        const isValid = digits.length >= 7 && digits.length <= 15 && !digits.startsWith('0');
        
        return new Response(JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          phoneNumber: {
            original: phoneNumber,
            cleaned: cleanPhone,
            isValid: isValid,
            digits: digits,
            length: digits.length
          }
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });

      case 'test-modal':
        return new Response(JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          modal: {
            elementExists: true,
            functionAvailable: true,
            status: 'ready'
          },
          instructions: [
            '1. Open browser console on https://tetrixcorp.com',
            '2. Click Client Login button',
            '3. Check if Industry Auth modal opens',
            '4. Run: window.industryAuthDebugger.testModalFunctionality()'
          ]
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });

      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid action. Available actions: status, test-phone, test-modal'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'test-phone-validation':
        const phoneNumbers = data?.phoneNumbers || ['+15551234567', '+442079460958'];
        const results = phoneNumbers.map((phone: string) => {
          let cleanPhone = phone.replace(/[^\d+]/g, '');
          if (cleanPhone.startsWith('++')) {
            cleanPhone = cleanPhone.substring(1);
          }
          if (!cleanPhone.startsWith('+')) {
            cleanPhone = '+' + cleanPhone;
          }
          
          const digits = cleanPhone.slice(1).replace(/\D/g, '');
          const isValid = digits.length >= 7 && digits.length <= 15 && !digits.startsWith('0');
          
          return {
            original: phone,
            cleaned: cleanPhone,
            isValid: isValid,
            digits: digits,
            length: digits.length
          };
        });

        return new Response(JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          results: results
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });

      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid action for POST request'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
