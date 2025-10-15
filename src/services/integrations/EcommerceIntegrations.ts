// TETRIX E-commerce Integration Service
// Shopify, Wix, WooCommerce, and other e-commerce platform integrations

export interface EcommerceConfig {
  platform: 'shopify' | 'wix' | 'woocommerce' | 'magento' | 'bigcommerce' | 'squarespace';
  apiKey: string;
  apiSecret?: string;
  accessToken?: string;
  storeUrl: string;
  webhookSecret?: string;
  version?: string;
  timeout?: number;
}

export interface EcommerceProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  inventoryQuantity: number;
  weight?: number;
  weightUnit: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  images: EcommerceImage[];
  variants: EcommerceVariant[];
  tags: string[];
  categories: string[];
  seoTitle?: string;
  seoDescription?: string;
  status: 'active' | 'draft' | 'archived';
  visibility: 'visible' | 'hidden';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  customFields?: Record<string, any>;
}

export interface EcommerceImage {
  id: string;
  url: string;
  altText?: string;
  position: number;
  width: number;
  height: number;
  size: number;
}

export interface EcommerceVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  inventoryQuantity: number;
  weight?: number;
  weightUnit: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  options: Record<string, string>;
  image?: EcommerceImage;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface EcommerceOrder {
  id: string;
  orderNumber: string;
  email: string;
  phone?: string;
  customer: EcommerceCustomer;
  billingAddress: EcommerceAddress;
  shippingAddress: EcommerceAddress;
  lineItems: EcommerceLineItem[];
  subtotal: number;
  totalTax: number;
  totalShipping: number;
  totalDiscount: number;
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled';
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'partially_refunded';
  paymentMethod: string;
  shippingMethod?: string;
  trackingNumber?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  customFields?: Record<string, any>;
}

export interface EcommerceCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptsMarketing: boolean;
  tags: string[];
  totalSpent: number;
  ordersCount: number;
  createdAt: string;
  updatedAt: string;
  addresses: EcommerceAddress[];
  defaultAddress?: EcommerceAddress;
  customFields?: Record<string, any>;
}

export interface EcommerceAddress {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
  isDefault?: boolean;
}

export interface EcommerceLineItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle?: string;
  sku: string;
  quantity: number;
  price: number;
  totalPrice: number;
  requiresShipping: boolean;
  taxable: boolean;
  fulfillmentStatus?: string;
  customFields?: Record<string, any>;
}

export interface EcommerceCollection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: EcommerceImage;
  seoTitle?: string;
  seoDescription?: string;
  status: 'active' | 'draft' | 'archived';
  visibility: 'visible' | 'hidden';
  sortOrder: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  customFields?: Record<string, any>;
}

export interface EcommerceWebhook {
  id: string;
  topic: string;
  address: string;
  format: 'json' | 'xml';
  fields?: string[];
  metafieldNamespaces?: string[];
  apiVersion?: string;
  privateMetafieldNamespaces?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EcommerceAnalytics {
  period: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  conversionRate: number;
  topProducts: Array<{
    productId: string;
    title: string;
    quantity: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    customerId: string;
    name: string;
    email: string;
    totalSpent: number;
    ordersCount: number;
  }>;
  trafficSources: Array<{
    source: string;
    sessions: number;
    orders: number;
    revenue: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    sessions: number;
    orders: number;
    revenue: number;
  }>;
}

export interface EcommerceInventory {
  productId: string;
  variantId: string;
  sku: string;
  quantity: number;
  reserved: number;
  available: number;
  locationId?: string;
  locationName?: string;
  lastUpdated: string;
}

export interface EcommerceFulfillment {
  id: string;
  orderId: string;
  status: 'pending' | 'open' | 'success' | 'cancelled' | 'error' | 'failure';
  trackingCompany?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  lineItems: Array<{
    id: string;
    quantity: number;
  }>;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

/**
 * Base E-commerce Integration Service
 */
export abstract class BaseEcommerceIntegration {
  protected config: EcommerceConfig;
  protected isConnected: boolean = false;

  constructor(config: EcommerceConfig) {
    this.config = config;
  }

  /**
   * Connect to e-commerce platform
   */
  abstract connect(): Promise<boolean>;

  /**
   * Disconnect from e-commerce platform
   */
  abstract disconnect(): Promise<void>;

  /**
   * Get products
   */
  abstract getProducts(filters?: any): Promise<EcommerceProduct[]>;

  /**
   * Get product by ID
   */
  abstract getProduct(productId: string): Promise<EcommerceProduct>;

  /**
   * Create product
   */
  abstract createProduct(product: Partial<EcommerceProduct>): Promise<EcommerceProduct>;

  /**
   * Update product
   */
  abstract updateProduct(productId: string, product: Partial<EcommerceProduct>): Promise<EcommerceProduct>;

  /**
   * Delete product
   */
  abstract deleteProduct(productId: string): Promise<boolean>;

  /**
   * Get orders
   */
  abstract getOrders(filters?: any): Promise<EcommerceOrder[]>;

  /**
   * Get order by ID
   */
  abstract getOrder(orderId: string): Promise<EcommerceOrder>;

  /**
   * Update order
   */
  abstract updateOrder(orderId: string, order: Partial<EcommerceOrder>): Promise<EcommerceOrder>;

  /**
   * Get customers
   */
  abstract getCustomers(filters?: any): Promise<EcommerceCustomer[]>;

  /**
   * Get customer by ID
   */
  abstract getCustomer(customerId: string): Promise<EcommerceCustomer>;

  /**
   * Create customer
   */
  abstract createCustomer(customer: Partial<EcommerceCustomer>): Promise<EcommerceCustomer>;

  /**
   * Update customer
   */
  abstract updateCustomer(customerId: string, customer: Partial<EcommerceCustomer>): Promise<EcommerceCustomer>;

  /**
   * Get collections
   */
  abstract getCollections(filters?: any): Promise<EcommerceCollection[]>;

  /**
   * Get collection by ID
   */
  abstract getCollection(collectionId: string): Promise<EcommerceCollection>;

  /**
   * Create collection
   */
  abstract createCollection(collection: Partial<EcommerceCollection>): Promise<EcommerceCollection>;

  /**
   * Update collection
   */
  abstract updateCollection(collectionId: string, collection: Partial<EcommerceCollection>): Promise<EcommerceCollection>;

  /**
   * Delete collection
   */
  abstract deleteCollection(collectionId: string): Promise<boolean>;

  /**
   * Get inventory
   */
  abstract getInventory(filters?: any): Promise<EcommerceInventory[]>;

  /**
   * Update inventory
   */
  abstract updateInventory(productId: string, variantId: string, quantity: number): Promise<boolean>;

  /**
   * Get analytics
   */
  abstract getAnalytics(period: string): Promise<EcommerceAnalytics>;

  /**
   * Create webhook
   */
  abstract createWebhook(webhook: Partial<EcommerceWebhook>): Promise<EcommerceWebhook>;

  /**
   * Get webhooks
   */
  abstract getWebhooks(): Promise<EcommerceWebhook[]>;

  /**
   * Delete webhook
   */
  abstract deleteWebhook(webhookId: string): Promise<boolean>;

  /**
   * Make authenticated API request
   */
  protected async makeAPIRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.isConnected) {
      throw new Error('Not connected to e-commerce platform');
    }

    const url = `${this.config.storeUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...this.getAuthHeaders(),
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers,
      timeout: this.config.timeout || 30000
    });

    if (!response.ok) {
      throw new Error(`E-commerce API request failed: ${response.statusText}`);
    }

    return response;
  }

  /**
   * Get authentication headers
   */
  protected abstract getAuthHeaders(): Record<string, string>;
}

/**
 * Shopify Integration Service
 */
export class TETRIXShopifyIntegration extends BaseEcommerceIntegration {
  constructor(config: EcommerceConfig) {
    super(config);
  }

  async connect(): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest('/admin/api/2023-10/shop.json');
      if (response.ok) {
        this.isConnected = true;
        console.log('✅ Connected to Shopify store');
        return true;
      } else {
        throw new Error('Shopify connection failed');
      }
    } catch (error) {
      console.error('❌ Failed to connect to Shopify:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('✅ Disconnected from Shopify store');
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'X-Shopify-Access-Token': this.config.accessToken || ''
    };
  }

  async getProducts(filters?: any): Promise<EcommerceProduct[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.title) params.append('title', filters.title);
      if (filters?.vendor) params.append('vendor', filters.vendor);
      if (filters?.product_type) params.append('product_type', filters.product_type);
      if (filters?.created_at_min) params.append('created_at_min', filters.created_at_min);
      if (filters?.created_at_max) params.append('created_at_max', filters.created_at_max);
      if (filters?.updated_at_min) params.append('updated_at_min', filters.updated_at_min);
      if (filters?.updated_at_max) params.append('updated_at_max', filters.updated_at_max);

      const response = await this.makeAPIRequest(`/admin/api/2023-10/products.json?${params.toString()}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.products?.length || 0} products from Shopify`);
      return this.mapShopifyProducts(data.products || []);
    } catch (error) {
      console.error('❌ Failed to get products from Shopify:', error);
      throw error;
    }
  }

  async getProduct(productId: string): Promise<EcommerceProduct> {
    try {
      const response = await this.makeAPIRequest(`/admin/api/2023-10/products/${productId}.json`);
      const data = await response.json();
      
      console.log(`✅ Retrieved product ${productId} from Shopify`);
      return this.mapShopifyProduct(data.product);
    } catch (error) {
      console.error('❌ Failed to get product from Shopify:', error);
      throw error;
    }
  }

  async createProduct(product: Partial<EcommerceProduct>): Promise<EcommerceProduct> {
    try {
      const shopifyProduct = this.mapToShopifyProduct(product);
      const response = await this.makeAPIRequest('/admin/api/2023-10/products.json', {
        method: 'POST',
        body: JSON.stringify({ product: shopifyProduct })
      });
      
      const data = await response.json();
      console.log('✅ Created product in Shopify');
      return this.mapShopifyProduct(data.product);
    } catch (error) {
      console.error('❌ Failed to create product in Shopify:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, product: Partial<EcommerceProduct>): Promise<EcommerceProduct> {
    try {
      const shopifyProduct = this.mapToShopifyProduct(product);
      const response = await this.makeAPIRequest(`/admin/api/2023-10/products/${productId}.json`, {
        method: 'PUT',
        body: JSON.stringify({ product: shopifyProduct })
      });
      
      const data = await response.json();
      console.log(`✅ Updated product ${productId} in Shopify`);
      return this.mapShopifyProduct(data.product);
    } catch (error) {
      console.error('❌ Failed to update product in Shopify:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest(`/admin/api/2023-10/products/${productId}.json`, {
        method: 'DELETE'
      });
      
      console.log(`✅ Deleted product ${productId} from Shopify`);
      return response.ok;
    } catch (error) {
      console.error('❌ Failed to delete product from Shopify:', error);
      throw error;
    }
  }

  async getOrders(filters?: any): Promise<EcommerceOrder[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.financial_status) params.append('financial_status', filters.financial_status);
      if (filters?.fulfillment_status) params.append('fulfillment_status', filters.fulfillment_status);
      if (filters?.created_at_min) params.append('created_at_min', filters.created_at_min);
      if (filters?.created_at_max) params.append('created_at_max', filters.created_at_max);

      const response = await this.makeAPIRequest(`/admin/api/2023-10/orders.json?${params.toString()}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.orders?.length || 0} orders from Shopify`);
      return this.mapShopifyOrders(data.orders || []);
    } catch (error) {
      console.error('❌ Failed to get orders from Shopify:', error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<EcommerceOrder> {
    try {
      const response = await this.makeAPIRequest(`/admin/api/2023-10/orders/${orderId}.json`);
      const data = await response.json();
      
      console.log(`✅ Retrieved order ${orderId} from Shopify`);
      return this.mapShopifyOrder(data.order);
    } catch (error) {
      console.error('❌ Failed to get order from Shopify:', error);
      throw error;
    }
  }

  async updateOrder(orderId: string, order: Partial<EcommerceOrder>): Promise<EcommerceOrder> {
    try {
      const shopifyOrder = this.mapToShopifyOrder(order);
      const response = await this.makeAPIRequest(`/admin/api/2023-10/orders/${orderId}.json`, {
        method: 'PUT',
        body: JSON.stringify({ order: shopifyOrder })
      });
      
      const data = await response.json();
      console.log(`✅ Updated order ${orderId} in Shopify`);
      return this.mapShopifyOrder(data.order);
    } catch (error) {
      console.error('❌ Failed to update order in Shopify:', error);
      throw error;
    }
  }

  async getCustomers(filters?: any): Promise<EcommerceCustomer[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.email) params.append('email', filters.email);
      if (filters?.created_at_min) params.append('created_at_min', filters.created_at_min);
      if (filters?.created_at_max) params.append('created_at_max', filters.created_at_max);

      const response = await this.makeAPIRequest(`/admin/api/2023-10/customers.json?${params.toString()}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.customers?.length || 0} customers from Shopify`);
      return this.mapShopifyCustomers(data.customers || []);
    } catch (error) {
      console.error('❌ Failed to get customers from Shopify:', error);
      throw error;
    }
  }

  async getCustomer(customerId: string): Promise<EcommerceCustomer> {
    try {
      const response = await this.makeAPIRequest(`/admin/api/2023-10/customers/${customerId}.json`);
      const data = await response.json();
      
      console.log(`✅ Retrieved customer ${customerId} from Shopify`);
      return this.mapShopifyCustomer(data.customer);
    } catch (error) {
      console.error('❌ Failed to get customer from Shopify:', error);
      throw error;
    }
  }

  async createCustomer(customer: Partial<EcommerceCustomer>): Promise<EcommerceCustomer> {
    try {
      const shopifyCustomer = this.mapToShopifyCustomer(customer);
      const response = await this.makeAPIRequest('/admin/api/2023-10/customers.json', {
        method: 'POST',
        body: JSON.stringify({ customer: shopifyCustomer })
      });
      
      const data = await response.json();
      console.log('✅ Created customer in Shopify');
      return this.mapShopifyCustomer(data.customer);
    } catch (error) {
      console.error('❌ Failed to create customer in Shopify:', error);
      throw error;
    }
  }

  async updateCustomer(customerId: string, customer: Partial<EcommerceCustomer>): Promise<EcommerceCustomer> {
    try {
      const shopifyCustomer = this.mapToShopifyCustomer(customer);
      const response = await this.makeAPIRequest(`/admin/api/2023-10/customers/${customerId}.json`, {
        method: 'PUT',
        body: JSON.stringify({ customer: shopifyCustomer })
      });
      
      const data = await response.json();
      console.log(`✅ Updated customer ${customerId} in Shopify`);
      return this.mapShopifyCustomer(data.customer);
    } catch (error) {
      console.error('❌ Failed to update customer in Shopify:', error);
      throw error;
    }
  }

  async getCollections(filters?: any): Promise<EcommerceCollection[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.title) params.append('title', filters.title);
      if (filters?.product_id) params.append('product_id', filters.product_id);

      const response = await this.makeAPIRequest(`/admin/api/2023-10/custom_collections.json?${params.toString()}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.custom_collections?.length || 0} collections from Shopify`);
      return this.mapShopifyCollections(data.custom_collections || []);
    } catch (error) {
      console.error('❌ Failed to get collections from Shopify:', error);
      throw error;
    }
  }

  async getCollection(collectionId: string): Promise<EcommerceCollection> {
    try {
      const response = await this.makeAPIRequest(`/admin/api/2023-10/custom_collections/${collectionId}.json`);
      const data = await response.json();
      
      console.log(`✅ Retrieved collection ${collectionId} from Shopify`);
      return this.mapShopifyCollection(data.custom_collection);
    } catch (error) {
      console.error('❌ Failed to get collection from Shopify:', error);
      throw error;
    }
  }

  async createCollection(collection: Partial<EcommerceCollection>): Promise<EcommerceCollection> {
    try {
      const shopifyCollection = this.mapToShopifyCollection(collection);
      const response = await this.makeAPIRequest('/admin/api/2023-10/custom_collections.json', {
        method: 'POST',
        body: JSON.stringify({ custom_collection: shopifyCollection })
      });
      
      const data = await response.json();
      console.log('✅ Created collection in Shopify');
      return this.mapShopifyCollection(data.custom_collection);
    } catch (error) {
      console.error('❌ Failed to create collection in Shopify:', error);
      throw error;
    }
  }

  async updateCollection(collectionId: string, collection: Partial<EcommerceCollection>): Promise<EcommerceCollection> {
    try {
      const shopifyCollection = this.mapToShopifyCollection(collection);
      const response = await this.makeAPIRequest(`/admin/api/2023-10/custom_collections/${collectionId}.json`, {
        method: 'PUT',
        body: JSON.stringify({ custom_collection: shopifyCollection })
      });
      
      const data = await response.json();
      console.log(`✅ Updated collection ${collectionId} in Shopify`);
      return this.mapShopifyCollection(data.custom_collection);
    } catch (error) {
      console.error('❌ Failed to update collection in Shopify:', error);
      throw error;
    }
  }

  async deleteCollection(collectionId: string): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest(`/admin/api/2023-10/custom_collections/${collectionId}.json`, {
        method: 'DELETE'
      });
      
      console.log(`✅ Deleted collection ${collectionId} from Shopify`);
      return response.ok;
    } catch (error) {
      console.error('❌ Failed to delete collection from Shopify:', error);
      throw error;
    }
  }

  async getInventory(filters?: any): Promise<EcommerceInventory[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.location_ids) params.append('location_ids', filters.location_ids.join(','));
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await this.makeAPIRequest(`/admin/api/2023-10/inventory_levels.json?${params.toString()}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.inventory_levels?.length || 0} inventory levels from Shopify`);
      return this.mapShopifyInventory(data.inventory_levels || []);
    } catch (error) {
      console.error('❌ Failed to get inventory from Shopify:', error);
      throw error;
    }
  }

  async updateInventory(productId: string, variantId: string, quantity: number): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest('/admin/api/2023-10/inventory_levels/adjust.json', {
        method: 'POST',
        body: JSON.stringify({
          location_id: 1, // Default location
          inventory_item_id: variantId,
          available_adjustment: quantity
        })
      });
      
      console.log(`✅ Updated inventory for product ${productId}, variant ${variantId} in Shopify`);
      return response.ok;
    } catch (error) {
      console.error('❌ Failed to update inventory in Shopify:', error);
      throw error;
    }
  }

  async getAnalytics(period: string): Promise<EcommerceAnalytics> {
    try {
      const response = await this.makeAPIRequest(`/admin/api/2023-10/analytics.json?period=${period}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved analytics for period ${period} from Shopify`);
      return this.mapShopifyAnalytics(data);
    } catch (error) {
      console.error('❌ Failed to get analytics from Shopify:', error);
      throw error;
    }
  }

  async createWebhook(webhook: Partial<EcommerceWebhook>): Promise<EcommerceWebhook> {
    try {
      const shopifyWebhook = this.mapToShopifyWebhook(webhook);
      const response = await this.makeAPIRequest('/admin/api/2023-10/webhooks.json', {
        method: 'POST',
        body: JSON.stringify({ webhook: shopifyWebhook })
      });
      
      const data = await response.json();
      console.log('✅ Created webhook in Shopify');
      return this.mapShopifyWebhook(data.webhook);
    } catch (error) {
      console.error('❌ Failed to create webhook in Shopify:', error);
      throw error;
    }
  }

  async getWebhooks(): Promise<EcommerceWebhook[]> {
    try {
      const response = await this.makeAPIRequest('/admin/api/2023-10/webhooks.json');
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.webhooks?.length || 0} webhooks from Shopify`);
      return this.mapShopifyWebhooks(data.webhooks || []);
    } catch (error) {
      console.error('❌ Failed to get webhooks from Shopify:', error);
      throw error;
    }
  }

  async deleteWebhook(webhookId: string): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest(`/admin/api/2023-10/webhooks/${webhookId}.json`, {
        method: 'DELETE'
      });
      
      console.log(`✅ Deleted webhook ${webhookId} from Shopify`);
      return response.ok;
    } catch (error) {
      console.error('❌ Failed to delete webhook from Shopify:', error);
      throw error;
    }
  }

  // Mapping methods for Shopify-specific data structures
  private mapShopifyProducts(products: any[]): EcommerceProduct[] {
    return products.map(product => this.mapShopifyProduct(product));
  }

  private mapShopifyProduct(product: any): EcommerceProduct {
    return {
      id: product.id.toString(),
      title: product.title,
      description: product.body_html || '',
      handle: product.handle,
      sku: product.variants?.[0]?.sku || '',
      price: parseFloat(product.variants?.[0]?.price || '0'),
      compareAtPrice: product.variants?.[0]?.compare_at_price ? parseFloat(product.variants[0].compare_at_price) : undefined,
      costPrice: product.variants?.[0]?.cost_price ? parseFloat(product.variants[0].cost_price) : undefined,
      inventoryQuantity: product.variants?.[0]?.inventory_quantity || 0,
      weight: product.variants?.[0]?.weight ? parseFloat(product.variants[0].weight) : undefined,
      weightUnit: product.variants?.[0]?.weight_unit || 'kg',
      images: this.mapShopifyImages(product.images || []),
      variants: this.mapShopifyVariants(product.variants || []),
      tags: product.tags ? product.tags.split(',').map((tag: string) => tag.trim()) : [],
      categories: product.product_type ? [product.product_type] : [],
      seoTitle: product.seo_title,
      seoDescription: product.seo_description,
      status: product.status === 'active' ? 'active' : 'draft',
      visibility: product.published_at ? 'visible' : 'hidden',
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      publishedAt: product.published_at,
      customFields: product.metafields || {}
    };
  }

  private mapShopifyImages(images: any[]): EcommerceImage[] {
    return images.map((image, index) => ({
      id: image.id.toString(),
      url: image.src,
      altText: image.alt,
      position: image.position || index,
      width: image.width || 0,
      height: image.height || 0,
      size: image.size || 0
    }));
  }

  private mapShopifyVariants(variants: any[]): EcommerceVariant[] {
    return variants.map(variant => ({
      id: variant.id.toString(),
      title: variant.title,
      sku: variant.sku || '',
      price: parseFloat(variant.price || '0'),
      compareAtPrice: variant.compare_at_price ? parseFloat(variant.compare_at_price) : undefined,
      costPrice: variant.cost_price ? parseFloat(variant.cost_price) : undefined,
      inventoryQuantity: variant.inventory_quantity || 0,
      weight: variant.weight ? parseFloat(variant.weight) : undefined,
      weightUnit: variant.weight_unit || 'kg',
      options: variant.option1 ? { option1: variant.option1, option2: variant.option2, option3: variant.option3 } : {},
      position: variant.position || 0,
      createdAt: variant.created_at,
      updatedAt: variant.updated_at
    }));
  }

  private mapShopifyOrders(orders: any[]): EcommerceOrder[] {
    return orders.map(order => this.mapShopifyOrder(order));
  }

  private mapShopifyOrder(order: any): EcommerceOrder {
    return {
      id: order.id.toString(),
      orderNumber: order.order_number?.toString() || order.name,
      email: order.email,
      phone: order.phone,
      customer: this.mapShopifyCustomer(order.customer),
      billingAddress: this.mapShopifyAddress(order.billing_address),
      shippingAddress: this.mapShopifyAddress(order.shipping_address),
      lineItems: this.mapShopifyLineItems(order.line_items || []),
      subtotal: parseFloat(order.subtotal_price || '0'),
      totalTax: parseFloat(order.total_tax || '0'),
      totalShipping: parseFloat(order.total_shipping_price_set?.shop_money?.amount || '0'),
      totalDiscount: parseFloat(order.total_discounts || '0'),
      total: parseFloat(order.total_price || '0'),
      currency: order.currency,
      status: this.mapShopifyOrderStatus(order.fulfillment_status),
      fulfillmentStatus: this.mapShopifyFulfillmentStatus(order.fulfillment_status),
      paymentStatus: this.mapShopifyPaymentStatus(order.financial_status),
      paymentMethod: order.payment_gateway_names?.[0] || '',
      shippingMethod: order.shipping_lines?.[0]?.title,
      trackingNumber: order.fulfillments?.[0]?.tracking_number,
      notes: order.note,
      tags: order.tags ? order.tags.split(',').map((tag: string) => tag.trim()) : [],
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      processedAt: order.processed_at,
      shippedAt: order.fulfillments?.[0]?.created_at,
      deliveredAt: order.fulfillments?.[0]?.updated_at,
      cancelledAt: order.cancelled_at,
      customFields: order.metafields || {}
    };
  }

  private mapShopifyCustomers(customers: any[]): EcommerceCustomer[] {
    return customers.map(customer => this.mapShopifyCustomer(customer));
  }

  private mapShopifyCustomer(customer: any): EcommerceCustomer {
    return {
      id: customer.id.toString(),
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      phone: customer.phone,
      acceptsMarketing: customer.accepts_marketing,
      tags: customer.tags ? customer.tags.split(',').map((tag: string) => tag.trim()) : [],
      totalSpent: parseFloat(customer.total_spent || '0'),
      ordersCount: customer.orders_count || 0,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      addresses: customer.addresses ? customer.addresses.map((addr: any) => this.mapShopifyAddress(addr)) : [],
      defaultAddress: customer.default_address ? this.mapShopifyAddress(customer.default_address) : undefined,
      customFields: customer.metafields || {}
    };
  }

  private mapShopifyAddress(address: any): EcommerceAddress {
    return {
      id: address.id?.toString(),
      firstName: address.first_name,
      lastName: address.last_name,
      company: address.company,
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      province: address.province,
      country: address.country,
      zip: address.zip,
      phone: address.phone,
      isDefault: address.default
    };
  }

  private mapShopifyLineItems(lineItems: any[]): EcommerceLineItem[] {
    return lineItems.map(item => ({
      id: item.id.toString(),
      productId: item.product_id.toString(),
      variantId: item.variant_id.toString(),
      title: item.title,
      variantTitle: item.variant_title,
      sku: item.sku,
      quantity: item.quantity,
      price: parseFloat(item.price || '0'),
      totalPrice: parseFloat(item.price || '0') * item.quantity,
      requiresShipping: item.requires_shipping,
      taxable: item.taxable,
      fulfillmentStatus: item.fulfillment_status,
      customFields: item.metafields || {}
    }));
  }

  private mapShopifyCollections(collections: any[]): EcommerceCollection[] {
    return collections.map(collection => this.mapShopifyCollection(collection));
  }

  private mapShopifyCollection(collection: any): EcommerceCollection {
    return {
      id: collection.id.toString(),
      title: collection.title,
      handle: collection.handle,
      description: collection.body_html,
      image: collection.image ? this.mapShopifyImages([collection.image])[0] : undefined,
      seoTitle: collection.seo_title,
      seoDescription: collection.seo_description,
      status: collection.published ? 'active' : 'draft',
      visibility: collection.published ? 'visible' : 'hidden',
      sortOrder: collection.sort_order,
      createdAt: collection.created_at,
      updatedAt: collection.updated_at,
      publishedAt: collection.published_at,
      customFields: collection.metafields || {}
    };
  }

  private mapShopifyInventory(inventoryLevels: any[]): EcommerceInventory[] {
    return inventoryLevels.map(level => ({
      productId: level.inventory_item_id.toString(),
      variantId: level.inventory_item_id.toString(),
      sku: level.sku || '',
      quantity: level.available || 0,
      reserved: 0,
      available: level.available || 0,
      locationId: level.location_id?.toString(),
      locationName: level.location_name,
      lastUpdated: level.updated_at
    }));
  }

  private mapShopifyAnalytics(data: any): EcommerceAnalytics {
    return {
      period: data.period || '30d',
      totalOrders: data.total_orders || 0,
      totalRevenue: parseFloat(data.total_revenue || '0'),
      averageOrderValue: parseFloat(data.average_order_value || '0'),
      totalCustomers: data.total_customers || 0,
      newCustomers: data.new_customers || 0,
      returningCustomers: data.returning_customers || 0,
      conversionRate: parseFloat(data.conversion_rate || '0'),
      topProducts: data.top_products || [],
      topCustomers: data.top_customers || [],
      trafficSources: data.traffic_sources || [],
      deviceBreakdown: data.device_breakdown || []
    };
  }

  private mapShopifyWebhooks(webhooks: any[]): EcommerceWebhook[] {
    return webhooks.map(webhook => this.mapShopifyWebhook(webhook));
  }

  private mapShopifyWebhook(webhook: any): EcommerceWebhook {
    return {
      id: webhook.id.toString(),
      topic: webhook.topic,
      address: webhook.address,
      format: webhook.format,
      fields: webhook.fields,
      metafieldNamespaces: webhook.metafield_namespaces,
      apiVersion: webhook.api_version,
      privateMetafieldNamespaces: webhook.private_metafield_namespaces,
      createdAt: webhook.created_at,
      updatedAt: webhook.updated_at
    };
  }

  // Helper methods for mapping to Shopify format
  private mapToShopifyProduct(product: Partial<EcommerceProduct>): any {
    return {
      title: product.title,
      body_html: product.description,
      handle: product.handle,
      product_type: product.categories?.[0],
      vendor: product.customFields?.vendor,
      tags: product.tags?.join(','),
      status: product.status === 'active' ? 'active' : 'draft',
      published: product.visibility === 'visible',
      seo_title: product.seoTitle,
      seo_description: product.seoDescription,
      variants: product.variants?.map(variant => ({
        price: variant.price.toString(),
        compare_at_price: variant.compareAtPrice?.toString(),
        cost_price: variant.costPrice?.toString(),
        sku: variant.sku,
        inventory_quantity: variant.inventoryQuantity,
        weight: variant.weight?.toString(),
        weight_unit: variant.weightUnit,
        option1: variant.options?.option1,
        option2: variant.options?.option2,
        option3: variant.options?.option3
      }))
    };
  }

  private mapToShopifyOrder(order: Partial<EcommerceOrder>): any {
    return {
      email: order.email,
      phone: order.phone,
      note: order.notes,
      tags: order.tags?.join(','),
      financial_status: this.mapToShopifyPaymentStatus(order.paymentStatus),
      fulfillment_status: this.mapToShopifyFulfillmentStatus(order.fulfillmentStatus)
    };
  }

  private mapToShopifyCustomer(customer: Partial<EcommerceCustomer>): any {
    return {
      email: customer.email,
      first_name: customer.firstName,
      last_name: customer.lastName,
      phone: customer.phone,
      accepts_marketing: customer.acceptsMarketing,
      tags: customer.tags?.join(',')
    };
  }

  private mapToShopifyCollection(collection: Partial<EcommerceCollection>): any {
    return {
      title: collection.title,
      handle: collection.handle,
      body_html: collection.description,
      published: collection.status === 'active',
      sort_order: collection.sortOrder,
      seo_title: collection.seoTitle,
      seo_description: collection.seoDescription
    };
  }

  private mapToShopifyWebhook(webhook: Partial<EcommerceWebhook>): any {
    return {
      topic: webhook.topic,
      address: webhook.address,
      format: webhook.format,
      fields: webhook.fields,
      metafield_namespaces: webhook.metafieldNamespaces,
      api_version: webhook.apiVersion,
      private_metafield_namespaces: webhook.privateMetafieldNamespaces
    };
  }

  private mapShopifyOrderStatus(fulfillmentStatus: string): 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' {
    switch (fulfillmentStatus) {
      case 'fulfilled': return 'shipped';
      case 'partial': return 'processing';
      case 'unfulfilled': return 'pending';
      default: return 'pending';
    }
  }

  private mapShopifyFulfillmentStatus(fulfillmentStatus: string): 'unfulfilled' | 'partial' | 'fulfilled' {
    switch (fulfillmentStatus) {
      case 'fulfilled': return 'fulfilled';
      case 'partial': return 'partial';
      default: return 'unfulfilled';
    }
  }

  private mapShopifyPaymentStatus(financialStatus: string): 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'partially_refunded' {
    switch (financialStatus) {
      case 'paid': return 'paid';
      case 'partially_paid': return 'partially_paid';
      case 'refunded': return 'refunded';
      case 'partially_refunded': return 'partially_refunded';
      default: return 'pending';
    }
  }

  private mapToShopifyPaymentStatus(paymentStatus?: string): string {
    switch (paymentStatus) {
      case 'paid': return 'paid';
      case 'partially_paid': return 'partially_paid';
      case 'refunded': return 'refunded';
      case 'partially_refunded': return 'partially_refunded';
      default: return 'pending';
    }
  }

  private mapToShopifyFulfillmentStatus(fulfillmentStatus?: string): string {
    switch (fulfillmentStatus) {
      case 'fulfilled': return 'fulfilled';
      case 'partial': return 'partial';
      default: return 'unfulfilled';
    }
  }
}

/**
 * Wix Integration Service
 */
export class TETRIXWixIntegration extends BaseEcommerceIntegration {
  constructor(config: EcommerceConfig) {
    super(config);
  }

  async connect(): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest('/v1/site');
      if (response.ok) {
        this.isConnected = true;
        console.log('✅ Connected to Wix store');
        return true;
      } else {
        throw new Error('Wix connection failed');
      }
    } catch (error) {
      console.error('❌ Failed to connect to Wix:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('✅ Disconnected from Wix store');
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.accessToken || ''}`
    };
  }

  // Implement Wix-specific methods similar to Shopify
  async getProducts(filters?: any): Promise<EcommerceProduct[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.status) params.append('status', filters.status);

      const response = await this.makeAPIRequest(`/v1/products?${params.toString()}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.products?.length || 0} products from Wix`);
      return this.mapWixProducts(data.products || []);
    } catch (error) {
      console.error('❌ Failed to get products from Wix:', error);
      throw error;
    }
  }

  async getProduct(productId: string): Promise<EcommerceProduct> {
    try {
      const response = await this.makeAPIRequest(`/v1/products/${productId}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved product ${productId} from Wix`);
      return this.mapWixProduct(data.product);
    } catch (error) {
      console.error('❌ Failed to get product from Wix:', error);
      throw error;
    }
  }

  async createProduct(product: Partial<EcommerceProduct>): Promise<EcommerceProduct> {
    try {
      const wixProduct = this.mapToWixProduct(product);
      const response = await this.makeAPIRequest('/v1/products', {
        method: 'POST',
        body: JSON.stringify({ product: wixProduct })
      });
      
      const data = await response.json();
      console.log('✅ Created product in Wix');
      return this.mapWixProduct(data.product);
    } catch (error) {
      console.error('❌ Failed to create product in Wix:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, product: Partial<EcommerceProduct>): Promise<EcommerceProduct> {
    try {
      const wixProduct = this.mapToWixProduct(product);
      const response = await this.makeAPIRequest(`/v1/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ product: wixProduct })
      });
      
      const data = await response.json();
      console.log(`✅ Updated product ${productId} in Wix`);
      return this.mapWixProduct(data.product);
    } catch (error) {
      console.error('❌ Failed to update product in Wix:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest(`/v1/products/${productId}`, {
        method: 'DELETE'
      });
      
      console.log(`✅ Deleted product ${productId} from Wix`);
      return response.ok;
    } catch (error) {
      console.error('❌ Failed to delete product from Wix:', error);
      throw error;
    }
  }

  // Implement other Wix methods...
  async getOrders(filters?: any): Promise<EcommerceOrder[]> {
    // Wix-specific implementation
    return [];
  }

  async getOrder(orderId: string): Promise<EcommerceOrder> {
    // Wix-specific implementation
    return {} as EcommerceOrder;
  }

  async updateOrder(orderId: string, order: Partial<EcommerceOrder>): Promise<EcommerceOrder> {
    // Wix-specific implementation
    return {} as EcommerceOrder;
  }

  async getCustomers(filters?: any): Promise<EcommerceCustomer[]> {
    // Wix-specific implementation
    return [];
  }

  async getCustomer(customerId: string): Promise<EcommerceCustomer> {
    // Wix-specific implementation
    return {} as EcommerceCustomer;
  }

  async createCustomer(customer: Partial<EcommerceCustomer>): Promise<EcommerceCustomer> {
    // Wix-specific implementation
    return {} as EcommerceCustomer;
  }

  async updateCustomer(customerId: string, customer: Partial<EcommerceCustomer>): Promise<EcommerceCustomer> {
    // Wix-specific implementation
    return {} as EcommerceCustomer;
  }

  async getCollections(filters?: any): Promise<EcommerceCollection[]> {
    // Wix-specific implementation
    return [];
  }

  async getCollection(collectionId: string): Promise<EcommerceCollection> {
    // Wix-specific implementation
    return {} as EcommerceCollection;
  }

  async createCollection(collection: Partial<EcommerceCollection>): Promise<EcommerceCollection> {
    // Wix-specific implementation
    return {} as EcommerceCollection;
  }

  async updateCollection(collectionId: string, collection: Partial<EcommerceCollection>): Promise<EcommerceCollection> {
    // Wix-specific implementation
    return {} as EcommerceCollection;
  }

  async deleteCollection(collectionId: string): Promise<boolean> {
    // Wix-specific implementation
    return false;
  }

  async getInventory(filters?: any): Promise<EcommerceInventory[]> {
    // Wix-specific implementation
    return [];
  }

  async updateInventory(productId: string, variantId: string, quantity: number): Promise<boolean> {
    // Wix-specific implementation
    return false;
  }

  async getAnalytics(period: string): Promise<EcommerceAnalytics> {
    // Wix-specific implementation
    return {} as EcommerceAnalytics;
  }

  async createWebhook(webhook: Partial<EcommerceWebhook>): Promise<EcommerceWebhook> {
    // Wix-specific implementation
    return {} as EcommerceWebhook;
  }

  async getWebhooks(): Promise<EcommerceWebhook[]> {
    // Wix-specific implementation
    return [];
  }

  async deleteWebhook(webhookId: string): Promise<boolean> {
    // Wix-specific implementation
    return false;
  }

  // Wix-specific mapping methods
  private mapWixProducts(products: any[]): EcommerceProduct[] {
    return products.map(product => this.mapWixProduct(product));
  }

  private mapWixProduct(product: any): EcommerceProduct {
    return {
      id: product.id,
      title: product.name,
      description: product.description || '',
      handle: product.slug,
      sku: product.sku || '',
      price: parseFloat(product.price?.price || '0'),
      compareAtPrice: product.price?.comparePrice ? parseFloat(product.price.comparePrice) : undefined,
      inventoryQuantity: product.inventory?.quantity || 0,
      weight: product.weight ? parseFloat(product.weight) : undefined,
      weightUnit: product.weightUnit || 'kg',
      images: product.media?.items?.map((item: any, index: number) => ({
        id: item.id,
        url: item.url,
        altText: item.altText,
        position: index,
        width: item.width || 0,
        height: item.height || 0,
        size: item.size || 0
      })) || [],
      variants: product.variants?.map((variant: any) => ({
        id: variant.id,
        title: variant.title,
        sku: variant.sku,
        price: parseFloat(variant.price || '0'),
        inventoryQuantity: variant.inventory?.quantity || 0,
        options: variant.options || {},
        position: variant.position || 0,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt
      })) || [],
      tags: product.tags || [],
      categories: product.categories || [],
      status: product.visible ? 'active' : 'draft',
      visibility: product.visible ? 'visible' : 'hidden',
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      customFields: product.customFields || {}
    };
  }

  private mapToWixProduct(product: Partial<EcommerceProduct>): any {
    return {
      name: product.title,
      description: product.description,
      slug: product.handle,
      sku: product.sku,
      price: {
        price: product.price?.toString(),
        comparePrice: product.compareAtPrice?.toString()
      },
      inventory: {
        quantity: product.inventoryQuantity
      },
      weight: product.weight?.toString(),
      weightUnit: product.weightUnit,
      visible: product.visibility === 'visible',
      tags: product.tags,
      categories: product.categories
    };
  }
}

/**
 * WooCommerce Integration Service
 */
export class TETRIXWooCommerceIntegration extends BaseEcommerceIntegration {
  constructor(config: EcommerceConfig) {
    super(config);
  }

  async connect(): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest('/wp-json/wc/v3/system_status');
      if (response.ok) {
        this.isConnected = true;
        console.log('✅ Connected to WooCommerce store');
        return true;
      } else {
        throw new Error('WooCommerce connection failed');
      }
    } catch (error) {
      console.error('❌ Failed to connect to WooCommerce:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('✅ Disconnected from WooCommerce store');
  }

  protected getAuthHeaders(): Record<string, string> {
    const credentials = btoa(`${this.config.apiKey}:${this.config.apiSecret}`);
    return {
      'Authorization': `Basic ${credentials}`
    };
  }

  // Implement WooCommerce-specific methods similar to Shopify
  async getProducts(filters?: any): Promise<EcommerceProduct[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.limit) params.append('per_page', filters.limit.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);

      const response = await this.makeAPIRequest(`/wp-json/wc/v3/products?${params.toString()}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.length} products from WooCommerce`);
      return this.mapWooCommerceProducts(data);
    } catch (error) {
      console.error('❌ Failed to get products from WooCommerce:', error);
      throw error;
    }
  }

  async getProduct(productId: string): Promise<EcommerceProduct> {
    try {
      const response = await this.makeAPIRequest(`/wp-json/wc/v3/products/${productId}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved product ${productId} from WooCommerce`);
      return this.mapWooCommerceProduct(data);
    } catch (error) {
      console.error('❌ Failed to get product from WooCommerce:', error);
      throw error;
    }
  }

  async createProduct(product: Partial<EcommerceProduct>): Promise<EcommerceProduct> {
    try {
      const wooProduct = this.mapToWooCommerceProduct(product);
      const response = await this.makeAPIRequest('/wp-json/wc/v3/products', {
        method: 'POST',
        body: JSON.stringify(wooProduct)
      });
      
      const data = await response.json();
      console.log('✅ Created product in WooCommerce');
      return this.mapWooCommerceProduct(data);
    } catch (error) {
      console.error('❌ Failed to create product in WooCommerce:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, product: Partial<EcommerceProduct>): Promise<EcommerceProduct> {
    try {
      const wooProduct = this.mapToWooCommerceProduct(product);
      const response = await this.makeAPIRequest(`/wp-json/wc/v3/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(wooProduct)
      });
      
      const data = await response.json();
      console.log(`✅ Updated product ${productId} in WooCommerce`);
      return this.mapWooCommerceProduct(data);
    } catch (error) {
      console.error('❌ Failed to update product in WooCommerce:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest(`/wp-json/wc/v3/products/${productId}`, {
        method: 'DELETE'
      });
      
      console.log(`✅ Deleted product ${productId} from WooCommerce`);
      return response.ok;
    } catch (error) {
      console.error('❌ Failed to delete product from WooCommerce:', error);
      throw error;
    }
  }

  // Implement other WooCommerce methods...
  async getOrders(filters?: any): Promise<EcommerceOrder[]> {
    // WooCommerce-specific implementation
    return [];
  }

  async getOrder(orderId: string): Promise<EcommerceOrder> {
    // WooCommerce-specific implementation
    return {} as EcommerceOrder;
  }

  async updateOrder(orderId: string, order: Partial<EcommerceOrder>): Promise<EcommerceOrder> {
    // WooCommerce-specific implementation
    return {} as EcommerceOrder;
  }

  async getCustomers(filters?: any): Promise<EcommerceCustomer[]> {
    // WooCommerce-specific implementation
    return [];
  }

  async getCustomer(customerId: string): Promise<EcommerceCustomer> {
    // WooCommerce-specific implementation
    return {} as EcommerceCustomer;
  }

  async createCustomer(customer: Partial<EcommerceCustomer>): Promise<EcommerceCustomer> {
    // WooCommerce-specific implementation
    return {} as EcommerceCustomer;
  }

  async updateCustomer(customerId: string, customer: Partial<EcommerceCustomer>): Promise<EcommerceCustomer> {
    // WooCommerce-specific implementation
    return {} as EcommerceCustomer;
  }

  async getCollections(filters?: any): Promise<EcommerceCollection[]> {
    // WooCommerce-specific implementation
    return [];
  }

  async getCollection(collectionId: string): Promise<EcommerceCollection> {
    // WooCommerce-specific implementation
    return {} as EcommerceCollection;
  }

  async createCollection(collection: Partial<EcommerceCollection>): Promise<EcommerceCollection> {
    // WooCommerce-specific implementation
    return {} as EcommerceCollection;
  }

  async updateCollection(collectionId: string, collection: Partial<EcommerceCollection>): Promise<EcommerceCollection> {
    // WooCommerce-specific implementation
    return {} as EcommerceCollection;
  }

  async deleteCollection(collectionId: string): Promise<boolean> {
    // WooCommerce-specific implementation
    return false;
  }

  async getInventory(filters?: any): Promise<EcommerceInventory[]> {
    // WooCommerce-specific implementation
    return [];
  }

  async updateInventory(productId: string, variantId: string, quantity: number): Promise<boolean> {
    // WooCommerce-specific implementation
    return false;
  }

  async getAnalytics(period: string): Promise<EcommerceAnalytics> {
    // WooCommerce-specific implementation
    return {} as EcommerceAnalytics;
  }

  async createWebhook(webhook: Partial<EcommerceWebhook>): Promise<EcommerceWebhook> {
    // WooCommerce-specific implementation
    return {} as EcommerceWebhook;
  }

  async getWebhooks(): Promise<EcommerceWebhook[]> {
    // WooCommerce-specific implementation
    return [];
  }

  async deleteWebhook(webhookId: string): Promise<boolean> {
    // WooCommerce-specific implementation
    return false;
  }

  // WooCommerce-specific mapping methods
  private mapWooCommerceProducts(products: any[]): EcommerceProduct[] {
    return products.map(product => this.mapWooCommerceProduct(product));
  }

  private mapWooCommerceProduct(product: any): EcommerceProduct {
    return {
      id: product.id.toString(),
      title: product.name,
      description: product.description || '',
      handle: product.slug,
      sku: product.sku || '',
      price: parseFloat(product.price || '0'),
      compareAtPrice: product.regular_price ? parseFloat(product.regular_price) : undefined,
      inventoryQuantity: product.stock_quantity || 0,
      weight: product.weight ? parseFloat(product.weight) : undefined,
      weightUnit: product.weight_unit || 'kg',
      images: product.images?.map((image: any, index: number) => ({
        id: image.id?.toString() || index.toString(),
        url: image.src,
        altText: image.alt,
        position: index,
        width: image.width || 0,
        height: image.height || 0,
        size: 0
      })) || [],
      variants: product.variations?.map((variation: any) => ({
        id: variation.id.toString(),
        title: variation.name,
        sku: variation.sku || '',
        price: parseFloat(variation.price || '0'),
        inventoryQuantity: variation.stock_quantity || 0,
        options: variation.attributes || {},
        position: 0,
        createdAt: variation.date_created,
        updatedAt: variation.date_modified
      })) || [],
      tags: product.tags?.map((tag: any) => tag.name) || [],
      categories: product.categories?.map((cat: any) => cat.name) || [],
      status: product.status === 'publish' ? 'active' : 'draft',
      visibility: product.catalog_visibility === 'visible' ? 'visible' : 'hidden',
      createdAt: product.date_created,
      updatedAt: product.date_modified,
      customFields: product.meta_data || {}
    };
  }

  private mapToWooCommerceProduct(product: Partial<EcommerceProduct>): any {
    return {
      name: product.title,
      description: product.description,
      slug: product.handle,
      sku: product.sku,
      price: product.price?.toString(),
      regular_price: product.compareAtPrice?.toString(),
      stock_quantity: product.inventoryQuantity,
      weight: product.weight?.toString(),
      weight_unit: product.weightUnit,
      status: product.status === 'active' ? 'publish' : 'draft',
      catalog_visibility: product.visibility === 'visible' ? 'visible' : 'hidden',
      tags: product.tags?.map(tag => ({ name: tag })),
      categories: product.categories?.map(cat => ({ name: cat }))
    };
  }
}

/**
 * E-commerce Integration Factory
 */
export class EcommerceIntegrationFactory {
  /**
   * Create Shopify integration
   */
  static createShopifyIntegration(settings: any): TETRIXShopifyIntegration {
    const config: EcommerceConfig = {
      platform: 'shopify',
      apiKey: settings.apiKey,
      accessToken: settings.accessToken,
      storeUrl: settings.storeUrl,
      webhookSecret: settings.webhookSecret,
      version: settings.version || '2023-10',
      timeout: settings.timeout || 30000
    };

    return new TETRIXShopifyIntegration(config);
  }

  /**
   * Create Wix integration
   */
  static createWixIntegration(settings: any): TETRIXWixIntegration {
    const config: EcommerceConfig = {
      platform: 'wix',
      apiKey: settings.apiKey,
      accessToken: settings.accessToken,
      storeUrl: settings.storeUrl,
      version: settings.version || '1.0',
      timeout: settings.timeout || 30000
    };

    return new TETRIXWixIntegration(config);
  }

  /**
   * Create WooCommerce integration
   */
  static createWooCommerceIntegration(settings: any): TETRIXWooCommerceIntegration {
    const config: EcommerceConfig = {
      platform: 'woocommerce',
      apiKey: settings.apiKey,
      apiSecret: settings.apiSecret,
      storeUrl: settings.storeUrl,
      version: settings.version || '3.0',
      timeout: settings.timeout || 30000
    };

    return new TETRIXWooCommerceIntegration(config);
  }
}
