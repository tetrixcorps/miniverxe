// Dashboard Product Service
// Manages products and cart functionality for industry-specific dashboards

export interface DashboardProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  industry: 'healthcare' | 'legal' | 'construction' | 'logistics' | 'business';
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  customizations?: Record<string, any>;
  addedAt: Date;
}

export interface Cart {
  id: string;
  userId: string;
  customerId: string;
  industry: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartRequest {
  cartId: string;
  productId: string;
  quantity?: number;
  customizations?: Record<string, any>;
}

export interface RemoveFromCartRequest {
  cartId: string;
  productId: string;
}

export interface CheckoutRequest {
  cartId: string;
  customerId: string;
  paymentMethodId: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

// Mock data for now
const mockProducts: DashboardProduct[] = [
  {
    id: 'prod_healthcare_basic',
    name: 'Healthcare Basic Plan',
    description: 'Essential healthcare communication tools',
    price: 150,
    category: 'communication',
    industry: 'healthcare',
    features: ['Voice calls', 'SMS', 'Patient notifications'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prod_legal_standard',
    name: 'Legal Standard Plan',
    description: 'Complete legal practice management',
    price: 200,
    category: 'management',
    industry: 'legal',
    features: ['Client communication', 'Case management', 'Billing integration'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prod_construction_pro',
    name: 'Construction Pro Plan',
    description: 'Advanced construction project management',
    price: 250,
    category: 'project_management',
    industry: 'construction',
    features: ['Team coordination', 'Safety alerts', 'Resource tracking'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prod_logistics_fleet',
    name: 'Logistics Fleet Plan',
    description: 'Comprehensive fleet management solution',
    price: 300,
    category: 'fleet_management',
    industry: 'logistics',
    features: ['Vehicle tracking', 'Driver management', 'Route optimization'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockCarts: Map<string, Cart> = new Map();

export class DashboardProductService {
  async getProducts(industry?: string): Promise<DashboardProduct[]> {
    if (industry) {
      return mockProducts.filter(product => product.industry === industry);
    }
    return mockProducts;
  }

  async getProductById(id: string): Promise<DashboardProduct | null> {
    return mockProducts.find(product => product.id === id) || null;
  }

  async getCart(cartId: string): Promise<Cart | null> {
    return mockCarts.get(cartId) || null;
  }

  async createCart(userId: string, customerId?: string, industry?: string): Promise<Cart> {
    const cart: Cart = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      customerId: customerId || userId,
      industry: industry || 'business',
      items: [],
      total: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockCarts.set(cart.id, cart);
    return cart;
  }

  async addToCart(request: AddToCartRequest): Promise<Cart> {
    const cart = mockCarts.get(request.cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    const product = await this.getProductById(request.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const existingItem = cart.items.find(item => item.productId === request.productId);
    if (existingItem) {
      existingItem.quantity += request.quantity || 1;
    } else {
      cart.items.push({
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: request.productId,
        quantity: request.quantity || 1,
        customizations: request.customizations,
        addedAt: new Date()
      });
    }

    this.calculateCartTotal(cart);
    cart.updatedAt = new Date();
    mockCarts.set(cart.id, cart);
    return cart;
  }


  async clearCart(cartId: string): Promise<Cart> {
    const cart = mockCarts.get(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = [];
    cart.total = 0;
    cart.updatedAt = new Date();
    mockCarts.set(cart.id, cart);
    return cart;
  }

  private calculateCartTotal(cart: Cart): void {
    cart.total = cart.items.reduce((total, item) => {
      const product = mockProducts.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  async processCheckout(request: CheckoutRequest): Promise<{ success: boolean; orderId?: string; error?: string }> {
    const cart = mockCarts.get(request.cartId);
    if (!cart) {
      return { success: false, error: 'Cart not found' };
    }

    if (cart.items.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    // In a real implementation, this would integrate with Stripe
    // For now, we'll simulate a successful checkout
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Clear the cart after successful checkout
    await this.clearCart(request.cartId);
    
    return { success: true, orderId };
  }

  /**
   * Validate cart for checkout
   */
  async validateCartForCheckout(cartId: string): Promise<{ valid: boolean; errors: string[] }> {
    const cart = mockCarts.get(cartId);
    if (!cart) {
      return { valid: false, errors: ['Cart not found'] };
    }

    if (cart.items.length === 0) {
      return { valid: false, errors: ['Cart is empty'] };
    }

    const errors: string[] = [];
    
    // Validate each item
    for (const item of cart.items) {
      const product = mockProducts.find(p => p.id === item.productId);
      if (!product) {
        errors.push(`Product ${item.productId} not found`);
      }
      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for product ${item.productId}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Create checkout session (placeholder for Stripe integration)
   */
  async createCheckoutSession(cartId: string, successUrl: string, cancelUrl: string): Promise<{ sessionId: string; url: string }> {
    // In a real implementation, this would create a Stripe checkout session
    const sessionId = `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      sessionId,
      url: `${successUrl}?session_id=${sessionId}`
    };
  }

  /**
   * Get product by ID (alias for getProductById)
   */
  async getProduct(productId: string): Promise<DashboardProduct | undefined> {
    const product = await this.getProductById(productId);
    return product || undefined;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(cartId: string, productId: string): Promise<boolean> {
    const cart = mockCarts.get(cartId);
    if (!cart) {
      return false;
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item.productId !== productId);
    
    if (cart.items.length < initialLength) {
      this.calculateCartTotal(cart);
      cart.updatedAt = new Date();
      mockCarts.set(cartId, cart);
      return true;
    }
    
    return false;
  }
}

export const dashboardProductService = new DashboardProductService();