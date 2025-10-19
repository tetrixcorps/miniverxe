/**
 * E-commerce Integration Service
 * Handles integrations with Shopify, Wix, WooCommerce, and other e-commerce platforms
 */

export interface EcommerceConfig {
  provider: 'shopify' | 'wix' | 'woocommerce' | 'magento' | 'bigcommerce';
  apiKey: string;
  baseUrl: string;
  storeId: string;
  webhookSecret: string;
  region: string;
}

export interface ProductData {
  id: string;
  title: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  barcode?: string;
  inventory: {
    quantity: number;
    trackQuantity: boolean;
    allowBackorder: boolean;
  };
  images: string[];
  variants: ProductVariant[];
  categories: string[];
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  sku: string;
  inventory: number;
  options: Record<string, string>;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  items: OrderItem[];
  shipping: {
    address: Address;
    method: string;
    cost: number;
  };
  billing: {
    address: Address;
    method: string;
  };
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface CustomerData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addresses: Address[];
  tags: string[];
  totalSpent: number;
  orderCount: number;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface EcommerceIntegration {
  name: string;
  provider: string;
  features: string[];
  apiEndpoint: string;
  authentication: 'api_key' | 'oauth' | 'basic';
  supportedOperations: string[];
  webhookSupport: boolean;
}

// E-commerce platform integrations
export const ECOMMERCE_INTEGRATIONS: Record<string, EcommerceIntegration> = {
  shopify: {
    name: 'Shopify',
    provider: 'shopify',
    features: ['product_management', 'order_processing', 'customer_management', 'inventory_tracking', 'analytics'],
    apiEndpoint: 'https://api.shopify.com',
    authentication: 'oauth',
    supportedOperations: [
      'create_product',
      'update_product',
      'delete_product',
      'process_order',
      'update_inventory',
      'manage_customer',
      'generate_report'
    ],
    webhookSupport: true
  },
  wix: {
    name: 'Wix',
    provider: 'wix',
    features: ['product_management', 'order_processing', 'customer_management', 'website_management'],
    apiEndpoint: 'https://api.wix.com',
    authentication: 'oauth',
    supportedOperations: [
      'create_product',
      'update_product',
      'delete_product',
      'process_order',
      'manage_customer',
      'update_website'
    ],
    webhookSupport: true
  },
  woocommerce: {
    name: 'WooCommerce',
    provider: 'woocommerce',
    features: ['product_management', 'order_processing', 'customer_management', 'inventory_tracking'],
    apiEndpoint: 'https://api.woocommerce.com',
    authentication: 'api_key',
    supportedOperations: [
      'create_product',
      'update_product',
      'delete_product',
      'process_order',
      'update_inventory',
      'manage_customer'
    ],
    webhookSupport: true
  },
  magento: {
    name: 'Magento',
    provider: 'magento',
    features: ['product_management', 'order_processing', 'customer_management', 'inventory_tracking', 'catalog_management'],
    apiEndpoint: 'https://api.magento.com',
    authentication: 'oauth',
    supportedOperations: [
      'create_product',
      'update_product',
      'delete_product',
      'process_order',
      'update_inventory',
      'manage_customer',
      'manage_catalog'
    ],
    webhookSupport: true
  },
  bigcommerce: {
    name: 'BigCommerce',
    provider: 'bigcommerce',
    features: ['product_management', 'order_processing', 'customer_management', 'inventory_tracking', 'marketing_tools'],
    apiEndpoint: 'https://api.bigcommerce.com',
    authentication: 'oauth',
    supportedOperations: [
      'create_product',
      'update_product',
      'delete_product',
      'process_order',
      'update_inventory',
      'manage_customer',
      'marketing_automation'
    ],
    webhookSupport: true
  }
};

export class EcommerceIntegrationService {
  private config: EcommerceConfig;
  private integration: EcommerceIntegration;

  constructor(config: EcommerceConfig) {
    this.config = config;
    this.integration = ECOMMERCE_INTEGRATIONS[config.provider];
  }

  /**
   * Authenticate with e-commerce platform
   */
  async authenticate(): Promise<boolean> {
    try {
      const endpoint = `${this.integration.apiEndpoint}/auth`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify({
          storeId: this.config.storeId,
          region: this.config.region
        })
      });

      return response.ok;
    } catch (error) {
      console.error('E-commerce Authentication Error:', error);
      return false;
    }
  }

  /**
   * Create product
   */
  async createProduct(product: Omit<ProductData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const endpoint = `${this.integration.apiEndpoint}/products`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Store-ID': this.config.storeId
        },
        body: JSON.stringify(product)
      });

      if (response.ok) {
        const result = await response.json();
        return result.productId;
      }
      return null;
    } catch (error) {
      console.error('E-commerce Create Product Error:', error);
      return null;
    }
  }

  /**
   * Update product
   */
  async updateProduct(productId: string, updates: Partial<ProductData>): Promise<boolean> {
    try {
      const endpoint = `${this.integration.apiEndpoint}/products/${productId}`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Store-ID': this.config.storeId
        },
        body: JSON.stringify(updates)
      });

      return response.ok;
    } catch (error) {
      console.error('E-commerce Update Product Error:', error);
      return false;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const endpoint = `${this.integration.apiEndpoint}/products/${productId}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Store-ID': this.config.storeId
        }
      });

      return response.ok;
    } catch (error) {
      console.error('E-commerce Delete Product Error:', error);
      return false;
    }
  }

  /**
   * Get product
   */
  async getProduct(productId: string): Promise<ProductData | null> {
    try {
      const endpoint = `${this.integration.apiEndpoint}/products/${productId}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Store-ID': this.config.storeId
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.product;
      }
      return null;
    } catch (error) {
      console.error('E-commerce Get Product Error:', error);
      return null;
    }
  }

  /**
   * Process order
   */
  async processOrder(order: Omit<OrderData, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const endpoint = `${this.integration.apiEndpoint}/orders`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Store-ID': this.config.storeId
        },
        body: JSON.stringify(order)
      });

      if (response.ok) {
        const result = await response.json();
        return result.orderId;
      }
      return null;
    } catch (error) {
      console.error('E-commerce Process Order Error:', error);
      return null;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderData['status']): Promise<boolean> {
    try {
      const endpoint = `${this.integration.apiEndpoint}/orders/${orderId}`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Store-ID': this.config.storeId
        },
        body: JSON.stringify({ status })
      });

      return response.ok;
    } catch (error) {
      console.error('E-commerce Update Order Status Error:', error);
      return false;
    }
  }

  /**
   * Update inventory
   */
  async updateInventory(productId: string, variantId: string, quantity: number): Promise<boolean> {
    try {
      const endpoint = `${this.integration.apiEndpoint}/inventory`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Store-ID': this.config.storeId
        },
        body: JSON.stringify({
          productId,
          variantId,
          quantity
        })
      });

      return response.ok;
    } catch (error) {
      console.error('E-commerce Update Inventory Error:', error);
      return false;
    }
  }

  /**
   * Get customer
   */
  async getCustomer(customerId: string): Promise<CustomerData | null> {
    try {
      const endpoint = `${this.integration.apiEndpoint}/customers/${customerId}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Store-ID': this.config.storeId
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.customer;
      }
      return null;
    } catch (error) {
      console.error('E-commerce Get Customer Error:', error);
      return null;
    }
  }

  /**
   * Create customer
   */
  async createCustomer(customer: Omit<CustomerData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const endpoint = `${this.integration.apiEndpoint}/customers`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Store-ID': this.config.storeId
        },
        body: JSON.stringify(customer)
      });

      if (response.ok) {
        const result = await response.json();
        return result.customerId;
      }
      return null;
    } catch (error) {
      console.error('E-commerce Create Customer Error:', error);
      return null;
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(customerId: string, updates: Partial<CustomerData>): Promise<boolean> {
    try {
      const endpoint = `${this.integration.apiEndpoint}/customers/${customerId}`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Store-ID': this.config.storeId
        },
        body: JSON.stringify(updates)
      });

      return response.ok;
    } catch (error) {
      console.error('E-commerce Update Customer Error:', error);
      return false;
    }
  }

  /**
   * Get orders
   */
  async getOrders(filters?: {
    status?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<OrderData[]> {
    try {
      const endpoint = `${this.integration.apiEndpoint}/orders`;
      const queryParams = new URLSearchParams();
      queryParams.set('storeId', this.config.storeId);
      
      if (filters?.status) queryParams.set('status', filters.status);
      if (filters?.customerId) queryParams.set('customerId', filters.customerId);
      if (filters?.startDate) queryParams.set('startDate', filters.startDate);
      if (filters?.endDate) queryParams.set('endDate', filters.endDate);
      if (filters?.limit) queryParams.set('limit', filters.limit.toString());

      const response = await fetch(`${endpoint}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.orders || [];
      }
      return [];
    } catch (error) {
      console.error('E-commerce Get Orders Error:', error);
      return [];
    }
  }

  /**
   * Generate sales report
   */
  async generateSalesReport(dateRange: { start: string; end: string }): Promise<any> {
    try {
      const endpoint = `${this.integration.apiEndpoint}/reports/sales`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Store-ID': this.config.storeId
        },
        body: JSON.stringify(dateRange)
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('E-commerce Generate Sales Report Error:', error);
      return null;
    }
  }

  /**
   * Setup webhook
   */
  async setupWebhook(event: string, url: string): Promise<boolean> {
    try {
      const endpoint = `${this.integration.apiEndpoint}/webhooks`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Store-ID': this.config.storeId
        },
        body: JSON.stringify({
          event,
          url,
          secret: this.config.webhookSecret
        })
      });

      return response.ok;
    } catch (error) {
      console.error('E-commerce Setup Webhook Error:', error);
      return false;
    }
  }
}

// E-commerce Data Helper
export class EcommerceDataHelper {
  /**
   * Format price for display
   */
  static formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  }

  /**
   * Calculate order totals
   */
  static calculateOrderTotals(items: OrderItem[], taxRate: number = 0.08, shippingCost: number = 0): {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * taxRate;
    const shipping = shippingCost;
    const total = subtotal + tax + shipping;

    return {
      subtotal,
      tax,
      shipping,
      total
    };
  }

  /**
   * Validate SKU format
   */
  static validateSKU(sku: string): boolean {
    // Basic SKU validation (alphanumeric, 3-20 characters)
    return /^[A-Z0-9]{3,20}$/.test(sku);
  }

  /**
   * Generate product SKU
   */
  static generateSKU(prefix: string, productId: string): string {
    return `${prefix.toUpperCase()}-${productId.toUpperCase()}`;
  }

  /**
   * Format inventory status
   */
  static formatInventoryStatus(quantity: number, trackQuantity: boolean): string {
    if (!trackQuantity) return 'Unlimited';
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    return 'In Stock';
  }
}
