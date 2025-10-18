import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { customerId, industry } = body;

    if (!customerId || !industry) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Create a simple cart response
    const cartId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cart = {
      id: cartId,
      customerId,
      industry,
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Response(JSON.stringify({
      success: true,
      cartId: cart.id,
      cart
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error creating cart:', error);
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

export const GET: APIRoute = async ({ url }) => {
  try {
    const cartId = url.searchParams.get('cartId');
    
    if (!cartId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Cart ID required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Return a mock cart for now
    const cart = {
      id: cartId,
      customerId: 'customer_123',
      industry: 'logistics',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Response(JSON.stringify({
      success: true,
      cart
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error getting cart:', error);
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