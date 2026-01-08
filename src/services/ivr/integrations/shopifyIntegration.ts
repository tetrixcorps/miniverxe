// Shopify OMS Integration
// Implementation for Shopify order management system integration

import type { OMSIntegration, Order, OrderStatus, Return, ReturnData, Product, StoreLocation } from './backendIntegrationService';

export class ShopifyIntegration implements OMSIntegration {
  name = 'Shopify';
  type = 'oms' as const;
  isConnected = false;
  private apiKey: string;
  private apiSecret: string;
  private shopDomain: string;

  constructor(apiKey: string, apiSecret: string, shopDomain: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.shopDomain = shopDomain;
  }

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`https://${this.shopDomain}/admin/api/2024-01/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': this.apiKey
        }
      });

      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      console.error('Shopify connection error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`https://${this.shopDomain}/admin/api/2024-01/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': this.apiKey
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getOrder(orderNumber: string): Promise<Order | null> {
    const response = await fetch(`https://${this.shopDomain}/admin/api/2024-01/orders.json?name=${orderNumber}`, {
      headers: {
        'X-Shopify-Access-Token': this.apiKey
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const order = data.orders?.[0];
    if (!order) return null;

    return {
      id: order.id.toString(),
      orderNumber: order.name,
      customerId: order.customer?.id?.toString() || '',
      items: order.line_items.map((item: any) => ({
        productId: item.product_id.toString(),
        quantity: item.quantity,
        price: parseFloat(item.price)
      })),
      total: parseFloat(order.total_price),
      status: this.mapShopifyStatus(order.fulfillment_status),
      shippingAddress: order.shipping_address ? {
        street: order.shipping_address.address1,
        city: order.shipping_address.city,
        state: order.shipping_address.province,
        zip: order.shipping_address.zip,
        country: order.shipping_address.country
      } : undefined,
      createdAt: new Date(order.created_at)
    };
  }

  async searchOrders(query: string): Promise<Order[]> {
    const response = await fetch(`https://${this.shopDomain}/admin/api/2024-01/orders.json?name=${query}`, {
      headers: {
        'X-Shopify-Access-Token': this.apiKey
      }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.orders?.map((order: any) => ({
      id: order.id.toString(),
      orderNumber: order.name,
      customerId: order.customer?.id?.toString() || '',
      items: order.line_items.map((item: any) => ({
        productId: item.product_id.toString(),
        quantity: item.quantity,
        price: parseFloat(item.price)
      })),
      total: parseFloat(order.total_price),
      status: this.mapShopifyStatus(order.fulfillment_status),
      createdAt: new Date(order.created_at)
    })) || [];
  }

  async getOrderStatus(orderNumber: string): Promise<OrderStatus> {
    const order = await this.getOrder(orderNumber);
    return order?.status || 'pending';
  }

  async updateOrderStatus(orderNumber: string, status: OrderStatus): Promise<boolean> {
    const order = await this.getOrder(orderNumber);
    if (!order) return false;

    // Shopify doesn't directly update order status, but we can update fulfillment status
    const response = await fetch(`https://${this.shopDomain}/admin/api/2024-01/orders/${order.id}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order: {
          fulfillment_status: this.mapStatusToShopify(status)
        }
      })
    });

    return response.ok;
  }

  async createReturn(orderNumber: string, returnData: ReturnData): Promise<Return> {
    const order = await this.getOrder(orderNumber);
    if (!order) {
      throw new Error('Order not found');
    }

    // Create a return/refund in Shopify
    const refundAmount = returnData.items.reduce((sum, item) => {
      const orderItem = order.items.find(i => i.productId === item.productId);
      return sum + (orderItem ? orderItem.price * item.quantity : 0);
    }, 0);

    const response = await fetch(`https://${this.shopDomain}/admin/api/2024-01/orders/${order.id}/refunds.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refund: {
          note: `Return reason: ${returnData.items.map(i => i.reason).join(', ')}`,
          amount: refundAmount.toString(),
          currency: 'USD'
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create return');
    }

    const data = await response.json();
    return {
      id: data.refund.id.toString(),
      orderNumber,
      status: 'approved',
      refundAmount
    };
  }

  async getReturn(returnId: string): Promise<Return | null> {
    // Shopify refunds are tied to orders, so we'd need to search
    // This is a simplified implementation
    return null;
  }

  async getProduct(productId: string): Promise<Product | null> {
    const response = await fetch(`https://${this.shopDomain}/admin/api/2024-01/products/${productId}.json`, {
      headers: {
        'X-Shopify-Access-Token': this.apiKey
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const product = data.product;
    return {
      id: product.id.toString(),
      name: product.title,
      description: product.body_html,
      price: parseFloat(product.variants[0]?.price || '0'),
      inStock: product.variants[0]?.inventory_quantity > 0,
      stockQuantity: product.variants[0]?.inventory_quantity
    };
  }

  async searchProducts(query: string): Promise<Product[]> {
    const response = await fetch(`https://${this.shopDomain}/admin/api/2024-01/products.json?title=${encodeURIComponent(query)}`, {
      headers: {
        'X-Shopify-Access-Token': this.apiKey
      }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.products?.map((product: any) => ({
      id: product.id.toString(),
      name: product.title,
      description: product.body_html,
      price: parseFloat(product.variants[0]?.price || '0'),
      inStock: product.variants[0]?.inventory_quantity > 0,
      stockQuantity: product.variants[0]?.inventory_quantity
    })) || [];
  }

  async getStoreLocations(location?: { lat: number; lng: number }): Promise<StoreLocation[]> {
    // Shopify doesn't have a built-in store locator, but we can use locations API
    const response = await fetch(`https://${this.shopDomain}/admin/api/2024-01/locations.json`, {
      headers: {
        'X-Shopify-Access-Token': this.apiKey
      }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.locations?.map((loc: any) => ({
      id: loc.id.toString(),
      name: loc.name,
      address: {
        street: loc.address1 || '',
        city: loc.city || '',
        state: loc.province || '',
        zip: loc.zip || '',
        country: loc.country || ''
      },
      phone: loc.phone
    })) || [];
  }

  private mapShopifyStatus(status: string | null): OrderStatus {
    switch (status) {
      case 'fulfilled':
        return 'shipped';
      case 'partial':
        return 'processing';
      case 'restocked':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  private mapStatusToShopify(status: OrderStatus): string {
    switch (status) {
      case 'shipped':
        return 'fulfilled';
      case 'processing':
        return 'partial';
      case 'cancelled':
        return 'restocked';
      default:
        return 'unfulfilled';
    }
  }
}
