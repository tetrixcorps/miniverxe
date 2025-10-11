import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

const router = express.Router();

// Mock data store (in production, use a database)
const orders: any[] = [];

// Create new order
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      esimType,
      dataPlan,
      duration,
      region,
      quantity = 1
    } = req.body;

    // Validate required fields
    if (!customerId || !esimType || !dataPlan || !duration || !region) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['customerId', 'esimType', 'dataPlan', 'duration', 'region']
      });
    }

    // Create order
    const order = {
      id: uuidv4(),
      customerId,
      esimType,
      dataPlan,
      duration,
      region,
      quantity,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: moment().add(1, 'day').toISOString()
    };

    orders.push(order);

    res.status(201).json({
      success: true,
      order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { customerId, status, limit = 50, offset = 0 } = req.query;
    
    let filteredOrders = orders;
    
    if (customerId) {
      filteredOrders = filteredOrders.filter(order => order.customerId === customerId);
    }
    
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    
    const paginatedOrders = filteredOrders.slice(Number(offset), Number(offset) + Number(limit));
    
    res.status(200).json({
      success: true,
      orders: paginatedOrders,
      total: filteredOrders.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Failed to retrieve orders',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get specific order
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        orderId
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: 'Failed to retrieve order',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update order status
router.put('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingId, estimatedDelivery } = req.body;
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        error: 'Order not found',
        orderId
      });
    }
    
    const order = orders[orderIndex];
    
    if (status) order.status = status;
    if (trackingId) order.trackingId = trackingId;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
    
    order.updatedAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      order,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      error: 'Failed to update order',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cancel order
router.post('/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, refundAmount } = req.body;
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        error: 'Order not found',
        orderId
      });
    }
    
    const order = orders[orderIndex];
    
    if (order.status === 'cancelled') {
      return res.status(400).json({
        error: 'Order already cancelled'
      });
    }
    
    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.refundAmount = refundAmount;
    order.cancelledAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      order,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      error: 'Failed to cancel order',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
