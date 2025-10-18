// Dashboard Product Service
// Maps products and services for different industry dashboards

export interface DashboardProduct {
  id: string;
  name: string;
  description: string;
  category: 'subscription' | 'esim' | 'addon' | 'service';
  industry: 'healthcare' | 'construction' | 'logistics';
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  required: boolean;
  trialEligible: boolean;
  features: string[];
  metadata: Record<string, any>;
}

export interface CartItem {
  productId: string;
  quantity: number;
  customizations?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface DashboardCart {
  id: string;
  customerId: string;
  industry: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutSession {
  cartId: string;
  customerId: string;
  industry: string;
  items: CartItem[];
  total: number;
  currency: string;
  trialDays?: number;
  requiresPayment: boolean;
  metadata: Record<string, any>;
}

class DashboardProductService {
  private products: Map<string, DashboardProduct> = new Map();
  private carts: Map<string, DashboardCart> = new Map();

  constructor() {
    this.initializeProducts();
  }

  /**
   * Initialize products for each industry dashboard
   */
  private initializeProducts() {
    // Healthcare Products
    this.addProduct({
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
    });

    // Construction Products
    this.addProduct({
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
    });

    // Logistics Products
    this.addProduct({
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
    });

    // eSIM Products (Required for Logistics)
    this.addProduct({
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
    });

    this.addProduct({
      id: 'esim-fleet-premium',
      name: 'Fleet eSIM - Premium',
      description: 'eSIM for fleet vehicles with premium connectivity and advanced features',
      category: 'esim',
      industry: 'logistics',
      price: 45,
      currency: 'USD',
      billingCycle: 'monthly',
      required: false,
      trialEligible: false,
      features: [
        'Global connectivity',
        'Real-time tracking',
        'Advanced analytics',
        'Priority support',
        'Custom integrations'
      ],
      metadata: {
        dataLimit: 'unlimited',
        coverage: 'global',
        deviceType: 'vehicle',
        priority: 'high'
      }
    });

    // Contact Management Products
    this.addProduct({
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
    });

    this.addProduct({
      id: 'contact-management-advanced',
      name: 'Contact Management - Advanced',
      description: 'Advanced contact management with analytics and integrations',
      category: 'addon',
      industry: 'logistics',
      price: 35,
      currency: 'USD',
      billingCycle: 'monthly',
      required: false,
      trialEligible: false,
      features: [
        'Unlimited contacts',
        'Advanced analytics',
        'CRM integration',
        'Custom fields',
        'API access'
      ],
      metadata: {
        maxContacts: -1, // unlimited
        maxVehicles: -1, // unlimited
        integrations: ['salesforce', 'hubspot', 'zapier']
      }
    });

    // Healthcare Add-ons
    this.addProduct({
      id: 'healthcare-ehr-integration',
      name: 'EHR Integration',
      description: 'Advanced EHR integration with multiple systems',
      category: 'addon',
      industry: 'healthcare',
      price: 50,
      currency: 'USD',
      billingCycle: 'monthly',
      required: false,
      trialEligible: true,
      features: [
        'Epic integration',
        'Cerner integration',
        'Allscripts integration',
        'Custom EHR support'
      ],
      metadata: {
        supportedEHRs: ['epic', 'cerner', 'allscripts'],
        customIntegration: true
      }
    });

    // Construction Add-ons
    this.addProduct({
      id: 'construction-safety-compliance',
      name: 'Safety Compliance Module',
      description: 'Advanced safety compliance tracking and reporting',
      category: 'addon',
      industry: 'construction',
      price: 30,
      currency: 'USD',
      billingCycle: 'monthly',
      required: false,
      trialEligible: true,
      features: [
        'OSHA compliance',
        'Safety training tracking',
        'Incident reporting',
        'Compliance analytics'
      ],
      metadata: {
        complianceStandards: ['OSHA', 'ANSI', 'ISO'],
        reporting: true
      }
    });
  }

  private addProduct(product: DashboardProduct) {
    this.products.set(product.id, product);
  }

  /**
   * Get products for a specific industry dashboard
   */
  getProductsForIndustry(industry: string): DashboardProduct[] {
    return Array.from(this.products.values())
      .filter(product => product.industry === industry);
  }

  /**
   * Get required products for an industry
   */
  getRequiredProducts(industry: string): DashboardProduct[] {
    return this.getProductsForIndustry(industry)
      .filter(product => product.required);
  }

  /**
   * Get trial-eligible products
   */
  getTrialEligibleProducts(industry: string): DashboardProduct[] {
    return this.getProductsForIndustry(industry)
      .filter(product => product.trialEligible);
  }

  /**
   * Create a cart for a customer
   */
  createCart(customerId: string, industry: string): DashboardCart {
    const cartId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cart: DashboardCart = {
      id: cartId,
      customerId,
      industry,
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      currency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.carts.set(cartId, cart);
    return cart;
  }

  /**
   * Add product to cart
   */
  addToCart(cartId: string, productId: string, quantity: number = 1, customizations?: Record<string, any>): boolean {
    const cart = this.carts.get(cartId);
    const product = this.products.get(productId);

    if (!cart || !product) {
      return false;
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        customizations,
        metadata: product.metadata
      });
    }

    this.updateCartTotals(cart);
    return true;
  }

  /**
   * Remove product from cart
   */
  removeFromCart(cartId: string, productId: string): boolean {
    const cart = this.carts.get(cartId);
    if (!cart) return false;

    cart.items = cart.items.filter(item => item.productId !== productId);
    this.updateCartTotals(cart);
    return true;
  }

  /**
   * Update cart totals
   */
  private updateCartTotals(cart: DashboardCart) {
    cart.subtotal = cart.items.reduce((total, item) => {
      const product = this.products.get(item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);

    cart.tax = cart.subtotal * 0.08; // 8% tax
    cart.total = cart.subtotal + cart.tax;
    cart.updatedAt = new Date();
  }

  /**
   * Get cart by ID
   */
  getCart(cartId: string): DashboardCart | null {
    return this.carts.get(cartId) || null;
  }

  /**
   * Create checkout session
   */
  createCheckoutSession(cartId: string): CheckoutSession | null {
    const cart = this.carts.get(cartId);
    if (!cart) return null;

    const industry = cart.industry;
    const hasTrialProducts = cart.items.some(item => {
      const product = this.products.get(item.productId);
      return product?.trialEligible;
    });

    return {
      cartId,
      customerId: cart.customerId,
      industry,
      items: cart.items,
      total: cart.total,
      currency: cart.currency,
      trialDays: hasTrialProducts ? 7 : undefined,
      requiresPayment: cart.total > 0,
      metadata: {
        industry,
        hasTrial: hasTrialProducts,
        itemCount: cart.items.length
      }
    };
  }

  /**
   * Get product by ID
   */
  getProduct(productId: string): DashboardProduct | null {
    return this.products.get(productId) || null;
  }

  /**
   * Validate cart for checkout
   */
  validateCartForCheckout(cartId: string): { valid: boolean; errors: string[] } {
    const cart = this.carts.get(cartId);
    if (!cart) {
      return { valid: false, errors: ['Cart not found'] };
    }

    const errors: string[] = [];
    const industry = cart.industry;

    // Check for required products
    const requiredProducts = this.getRequiredProducts(industry);
    const cartProductIds = cart.items.map(item => item.productId);

    for (const requiredProduct of requiredProducts) {
      if (!cartProductIds.includes(requiredProduct.id)) {
        errors.push(`Required product missing: ${requiredProduct.name}`);
      }
    }

    // Industry-specific validation
    if (industry === 'logistics') {
      const hasESIM = cart.items.some(item => {
        const product = this.products.get(item.productId);
        return product?.category === 'esim';
      });

      if (!hasESIM) {
        errors.push('eSIM is required for fleet management');
      }

      const hasContactManagement = cart.items.some(item => {
        const product = this.products.get(item.productId);
        return product?.category === 'addon' && product.name.includes('Contact Management');
      });

      if (!hasContactManagement) {
        errors.push('Contact management is required for fleet management');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const dashboardProductService = new DashboardProductService();
