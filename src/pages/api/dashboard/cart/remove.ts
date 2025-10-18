import type { APIRoute } from 'astro';
import { dashboardProductService } from '/src/services/dashboardProductService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { cartId, productId } = body;

    if (!cartId || !productId) {
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

    // Remove product from cart
    const success = dashboardProductService.removeFromCart(cartId, productId);
    
    if (!success) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to remove product from cart'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Get updated cart
    const cart = dashboardProductService.getCart(cartId);

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
    console.error('Error removing from cart:', error);
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
