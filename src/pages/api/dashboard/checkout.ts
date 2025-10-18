import type { APIRoute } from 'astro';
import { dashboardProductService } from '/src/services/dashboardProductService';
import StripeCheckoutService from '../../../services/stripeCheckoutService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { cartId } = body;

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

    // Get cart
    const cart = dashboardProductService.getCart(cartId);
    if (!cart) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Cart not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Validate cart
    const validation = dashboardProductService.validateCartForCheckout(cartId);
    if (!validation.valid) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Cart validation failed',
        details: validation.errors
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Create checkout session
    const checkoutSession = dashboardProductService.createCheckoutSession(cartId);
    if (!checkoutSession) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to create checkout session'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Handle different checkout flows based on industry and requirements
    if (checkoutSession.requiresPayment) {
      // Create Stripe checkout session for paid items
      const stripeService = new StripeCheckoutService();
      
      // Map cart items to Stripe line items
      const lineItems = cart.items.map(item => {
        const product = dashboardProductService.getProduct(item.productId);
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product?.name || 'Unknown Product',
              description: product?.description || '',
            },
            unit_amount: Math.round((product?.price || 0) * 100), // Convert to cents
          },
          quantity: item.quantity,
        };
      });

      // Create Stripe checkout session
      const stripeSession = await stripeService.createTrialCheckoutSession({
        priceId: 'price_trial_7day', // Use trial price as base
        customerEmail: cart.customerId, // This should be actual customer email
        trialDays: checkoutSession.trialDays || 7,
        successUrl: `${request.url.split('/api')[0]}/dashboard?checkout=success&cart=${cartId}`,
        cancelUrl: `${request.url.split('/api')[0]}/dashboard?checkout=cancelled&cart=${cartId}`,
        metadata: {
          cartId,
          industry: cart.industry,
          itemCount: cart.items.length.toString()
        }
      }, {
        email: cart.customerId, // This should be actual customer email
        phoneNumber: '', // This should be actual customer phone
        name: '', // This should be actual customer name
        organization: '' // This should be actual organization name
      });

      if (stripeSession.success) {
        return new Response(JSON.stringify({
          success: true,
          checkoutUrl: stripeSession.checkoutUrl,
          sessionId: stripeSession.sessionId
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        return new Response(JSON.stringify({
          success: false,
          error: stripeSession.error || 'Failed to create Stripe checkout session'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    } else {
      // Handle trial-only checkout (no payment required)
      return new Response(JSON.stringify({
        success: true,
        checkoutUrl: `${request.url.split('/api')[0]}/dashboard?trial=success&cart=${cartId}`,
        sessionId: `trial_${cartId}`,
        trialOnly: true
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

  } catch (error) {
    console.error('Error processing checkout:', error);
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
