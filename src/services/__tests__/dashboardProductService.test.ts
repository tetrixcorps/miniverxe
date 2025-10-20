// Unit tests for Dashboard Product Service
import { describe, it, expect, beforeEach } from 'vitest';
import { dashboardProductService, type DashboardProduct, type Cart, type AddToCartRequest, type CheckoutRequest } from '../dashboardProductService';

describe('DashboardProductService', () => {
  beforeEach(() => {
    // Reset any state if needed
  });

  describe('Product Management', () => {
    it('should get all products', async () => {
      const products = await dashboardProductService.getProducts();
      
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
      
      products.forEach(product => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('description');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('industry');
        expect(product).toHaveProperty('features');
        expect(product).toHaveProperty('isActive');
        expect(product).toHaveProperty('createdAt');
        expect(product).toHaveProperty('updatedAt');
        
        expect(typeof product.id).toBe('string');
        expect(typeof product.name).toBe('string');
        expect(typeof product.description).toBe('string');
        expect(typeof product.price).toBe('number');
        expect(typeof product.category).toBe('string');
        expect(['healthcare', 'legal', 'construction', 'logistics', 'business']).toContain(product.industry);
        expect(Array.isArray(product.features)).toBe(true);
        expect(typeof product.isActive).toBe('boolean');
        expect(product.createdAt).toBeInstanceOf(Date);
        expect(product.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('should get products filtered by industry', async () => {
      const healthcareProducts = await dashboardProductService.getProducts('healthcare');
      
      expect(Array.isArray(healthcareProducts)).toBe(true);
      healthcareProducts.forEach(product => {
        expect(product.industry).toBe('healthcare');
      });
    });

    it('should get product by ID', async () => {
      const products = await dashboardProductService.getProducts();
      const firstProduct = products[0];
      
      const product = await dashboardProductService.getProductById(firstProduct.id);
      
      expect(product).not.toBeNull();
      expect(product?.id).toBe(firstProduct.id);
      expect(product?.name).toBe(firstProduct.name);
    });

    it('should return null for non-existent product ID', async () => {
      const product = await dashboardProductService.getProductById('non-existent-id');
      
      expect(product).toBeNull();
    });
  });

  describe('Cart Management', () => {
    it('should create a new cart', async () => {
      const userId = 'user-123';
      const customerId = 'customer-456';
      const industry = 'healthcare';
      
      const cart = await dashboardProductService.createCart(userId, customerId, industry);
      
      expect(cart).toHaveProperty('id');
      expect(cart).toHaveProperty('userId');
      expect(cart).toHaveProperty('customerId');
      expect(cart).toHaveProperty('industry');
      expect(cart).toHaveProperty('items');
      expect(cart).toHaveProperty('total');
      expect(cart).toHaveProperty('createdAt');
      expect(cart).toHaveProperty('updatedAt');
      
      expect(cart.userId).toBe(userId);
      expect(cart.customerId).toBe(customerId);
      expect(cart.industry).toBe(industry);
      expect(Array.isArray(cart.items)).toBe(true);
      expect(cart.items.length).toBe(0);
      expect(cart.total).toBe(0);
      expect(cart.createdAt).toBeInstanceOf(Date);
      expect(cart.updatedAt).toBeInstanceOf(Date);
    });

    it('should create cart with default values', async () => {
      const userId = 'user-123';
      
      const cart = await dashboardProductService.createCart(userId);
      
      expect(cart.userId).toBe(userId);
      expect(cart.customerId).toBe(userId);
      expect(cart.industry).toBe('business');
    });

    it('should get existing cart', async () => {
      const userId = 'user-123';
      const cart = await dashboardProductService.createCart(userId);
      
      const retrievedCart = await dashboardProductService.getCart(cart.id);
      
      expect(retrievedCart).not.toBeNull();
      expect(retrievedCart?.id).toBe(cart.id);
      expect(retrievedCart?.userId).toBe(cart.userId);
    });

    it('should return null for non-existent cart', async () => {
      const cart = await dashboardProductService.getCart('non-existent-cart-id');
      
      expect(cart).toBeNull();
    });
  });

  describe('Add to Cart', () => {
    let cart: Cart;
    let product: DashboardProduct;

    beforeEach(async () => {
      cart = await dashboardProductService.createCart('user-123');
      const products = await dashboardProductService.getProducts();
      product = products[0];
    });

    it('should add new item to cart', async () => {
      const request: AddToCartRequest = {
        cartId: cart.id,
        productId: product.id,
        quantity: 2
      };

      const updatedCart = await dashboardProductService.addToCart(request);
      
      expect(updatedCart.items.length).toBe(1);
      expect(updatedCart.items[0].productId).toBe(product.id);
      expect(updatedCart.items[0].quantity).toBe(2);
      expect(updatedCart.total).toBe(product.price * 2);
    });

    it('should update quantity for existing item', async () => {
      // Add item first time
      await dashboardProductService.addToCart({
        cartId: cart.id,
        productId: product.id,
        quantity: 1
      });

      // Add same item again
      const updatedCart = await dashboardProductService.addToCart({
        cartId: cart.id,
        productId: product.id,
        quantity: 2
      });

      expect(updatedCart.items.length).toBe(1);
      expect(updatedCart.items[0].quantity).toBe(3);
      expect(updatedCart.total).toBe(product.price * 3);
    });

    it('should add customizations to cart item', async () => {
      const customizations = {
        color: 'blue',
        size: 'large'
      };

      const request: AddToCartRequest = {
        cartId: cart.id,
        productId: product.id,
        quantity: 1,
        customizations
      };

      const updatedCart = await dashboardProductService.addToCart(request);
      
      expect(updatedCart.items[0].customizations).toEqual(customizations);
    });

    it('should throw error for non-existent cart', async () => {
      const request: AddToCartRequest = {
        cartId: 'non-existent-cart',
        productId: product.id,
        quantity: 1
      };

      await expect(dashboardProductService.addToCart(request)).rejects.toThrow('Cart not found');
    });

    it('should throw error for non-existent product', async () => {
      const request: AddToCartRequest = {
        cartId: cart.id,
        productId: 'non-existent-product',
        quantity: 1
      };

      await expect(dashboardProductService.addToCart(request)).rejects.toThrow('Product not found');
    });
  });

  describe('Remove from Cart', () => {
    let cart: Cart;
    let product: DashboardProduct;

    beforeEach(async () => {
      cart = await dashboardProductService.createCart('user-123');
      const products = await dashboardProductService.getProducts();
      product = products[0];
      
      await dashboardProductService.addToCart({
        cartId: cart.id,
        productId: product.id,
        quantity: 2
      });
    });

    it('should remove item from cart', async () => {
      const result = await dashboardProductService.removeFromCart(cart.id, product.id);
      
      expect(result).toBe(true);
      
      const updatedCart = await dashboardProductService.getCart(cart.id);
      expect(updatedCart?.items.length).toBe(0);
      expect(updatedCart?.total).toBe(0);
    });

    it('should return false for non-existent cart', async () => {
      const result = await dashboardProductService.removeFromCart('non-existent-cart', product.id);
      
      expect(result).toBe(false);
    });

    it('should return false for non-existent product in cart', async () => {
      const result = await dashboardProductService.removeFromCart(cart.id, 'non-existent-product');
      
      expect(result).toBe(false);
    });
  });

  describe('Clear Cart', () => {
    let cart: Cart;
    let product: DashboardProduct;

    beforeEach(async () => {
      cart = await dashboardProductService.createCart('user-123');
      const products = await dashboardProductService.getProducts();
      product = products[0];
      
      await dashboardProductService.addToCart({
        cartId: cart.id,
        productId: product.id,
        quantity: 2
      });
    });

    it('should clear all items from cart', async () => {
      const updatedCart = await dashboardProductService.clearCart(cart.id);
      
      expect(updatedCart.items.length).toBe(0);
      expect(updatedCart.total).toBe(0);
    });

    it('should throw error for non-existent cart', async () => {
      await expect(dashboardProductService.clearCart('non-existent-cart')).rejects.toThrow('Cart not found');
    });
  });

  describe('Checkout Process', () => {
    let cart: Cart;
    let product: DashboardProduct;

    beforeEach(async () => {
      cart = await dashboardProductService.createCart('user-123');
      const products = await dashboardProductService.getProducts();
      product = products[0];
      
      await dashboardProductService.addToCart({
        cartId: cart.id,
        productId: product.id,
        quantity: 1
      });
    });

    it('should process checkout successfully', async () => {
      const checkoutRequest: CheckoutRequest = {
        cartId: cart.id,
        customerId: 'customer-123',
        paymentMethodId: 'pm_123',
        billingAddress: {
          line1: '123 Main St',
          line2: 'Apt 4B',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'US'
        }
      };

      const result = await dashboardProductService.processCheckout(checkoutRequest);
      
      expect(result.success).toBe(true);
      expect(result.orderId).toBeDefined();
      expect(typeof result.orderId).toBe('string');
    });

    it('should fail checkout for non-existent cart', async () => {
      const checkoutRequest: CheckoutRequest = {
        cartId: 'non-existent-cart',
        customerId: 'customer-123',
        paymentMethodId: 'pm_123',
        billingAddress: {
          line1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'US'
        }
      };

      const result = await dashboardProductService.processCheckout(checkoutRequest);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cart not found');
    });

    it('should fail checkout for empty cart', async () => {
      const emptyCart = await dashboardProductService.createCart('user-456');
      
      const checkoutRequest: CheckoutRequest = {
        cartId: emptyCart.id,
        customerId: 'customer-123',
        paymentMethodId: 'pm_123',
        billingAddress: {
          line1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'US'
        }
      };

      const result = await dashboardProductService.processCheckout(checkoutRequest);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cart is empty');
    });
  });

  describe('Cart Validation', () => {
    let cart: Cart;
    let product: DashboardProduct;

    beforeEach(async () => {
      cart = await dashboardProductService.createCart('user-123');
      const products = await dashboardProductService.getProducts();
      product = products[0];
    });

    it('should validate cart with valid items', async () => {
      await dashboardProductService.addToCart({
        cartId: cart.id,
        productId: product.id,
        quantity: 1
      });

      const validation = await dashboardProductService.validateCartForCheckout(cart.id);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should fail validation for empty cart', async () => {
      const validation = await dashboardProductService.validateCartForCheckout(cart.id);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Cart is empty');
    });

    it('should fail validation for non-existent cart', async () => {
      const validation = await dashboardProductService.validateCartForCheckout('non-existent-cart');
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Cart not found');
    });
  });

  describe('Checkout Session', () => {
    it('should create checkout session', async () => {
      const cart = await dashboardProductService.createCart('user-123');
      const successUrl = 'https://example.com/success';
      const cancelUrl = 'https://example.com/cancel';

      const session = await dashboardProductService.createCheckoutSession(cart.id, successUrl, cancelUrl);
      
      expect(session).toHaveProperty('sessionId');
      expect(session).toHaveProperty('url');
      expect(typeof session.sessionId).toBe('string');
      expect(typeof session.url).toBe('string');
      expect(session.url).toContain(successUrl);
    });
  });

  describe('Product Retrieval', () => {
    it('should get product by ID using getProduct method', async () => {
      const products = await dashboardProductService.getProducts();
      const firstProduct = products[0];
      
      const product = await dashboardProductService.getProduct(firstProduct.id);
      
      expect(product).not.toBeUndefined();
      expect(product?.id).toBe(firstProduct.id);
    });

    it('should return undefined for non-existent product using getProduct method', async () => {
      const product = await dashboardProductService.getProduct('non-existent-id');
      
      expect(product).toBeUndefined();
    });
  });
});
