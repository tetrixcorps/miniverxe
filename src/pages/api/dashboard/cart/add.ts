import type { APIRoute } from 'astro';
import { dashboardProductService } from '/src/services/dashboardProductService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { cartId, productId, quantity = 1, customizations } = body;

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

    // Add product to cart
    const success = dashboardProductService.addToCart(cartId, productId, quantity, customizations);
    
    if (!success) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to add product to cart'
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
    console.error('Error adding to cart:', error);
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
