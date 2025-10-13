import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock payment data store
const payments: any[] = [];

// Process payment
router.post('/process', async (req, res) => {
  try {
    const {
      orderId,
      amount,
      currency = 'USD',
      paymentMethod,
      customerId,
      billingAddress
    } = req.body;

    // Validate required fields
    if (!orderId || !amount || !paymentMethod || !customerId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['orderId', 'amount', 'paymentMethod', 'customerId']
      });
    }

    // Create payment record
    const payment = {
      id: uuidv4(),
      orderId,
      amount: Number(amount),
      currency,
      paymentMethod,
      customerId,
      billingAddress,
      status: 'processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Simulate payment processing
    setTimeout(() => {
      const paymentIndex = payments.findIndex(p => p.id === payment.id);
      if (paymentIndex !== -1) {
        payments[paymentIndex].status = 'completed';
        payments[paymentIndex].completedAt = new Date().toISOString();
        payments[paymentIndex].updatedAt = new Date().toISOString();
      }
    }, 2000);

    payments.push(payment);

    res.status(201).json({
      success: true,
      payment,
      message: 'Payment processing initiated'
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      error: 'Failed to process payment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get payment status
router.get('/:paymentId/status', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) {
      return res.status(404).json({
        error: 'Payment not found',
        paymentId
      });
    }
    
    res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payment status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Refund payment
router.post('/refund', async (req, res) => {
  try {
    const { paymentId, reason, amount } = req.body;
    
    if (!paymentId || !reason) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['paymentId', 'reason']
      });
    }
    
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    
    if (paymentIndex === -1) {
      return res.status(404).json({
        error: 'Payment not found',
        paymentId
      });
    }
    
    const payment = payments[paymentIndex];
    
    if (payment.status !== 'completed') {
      return res.status(400).json({
        error: 'Payment not completed, cannot refund',
        status: payment.status
      });
    }
    
    const refundAmount = amount || payment.amount;
    
    const refund = {
      id: uuidv4(),
      paymentId,
      amount: refundAmount,
      currency: payment.currency,
      reason,
      status: 'processing',
      createdAt: new Date().toISOString()
    };
    
    // Simulate refund processing
    setTimeout(() => {
      const refundIndex = payments.findIndex(p => p.id === paymentId);
      if (refundIndex !== -1) {
        payments[refundIndex].refund = refund;
        payments[refundIndex].refund.status = 'completed';
        payments[refundIndex].refund.completedAt = new Date().toISOString();
      }
    }, 2000);
    
    res.status(201).json({
      success: true,
      refund,
      message: 'Refund initiated successfully'
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      error: 'Failed to process refund',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all payments
router.get('/', async (req, res) => {
  try {
    const { customerId, status, orderId, limit = 50, offset = 0 } = req.query;
    
    let filteredPayments = payments;
    
    if (customerId) {
      filteredPayments = filteredPayments.filter(payment => payment.customerId === customerId);
    }
    
    if (status) {
      filteredPayments = filteredPayments.filter(payment => payment.status === status);
    }
    
    if (orderId) {
      filteredPayments = filteredPayments.filter(payment => payment.orderId === orderId);
    }
    
    const paginatedPayments = filteredPayments.slice(Number(offset), Number(offset) + Number(limit));
    
    res.status(200).json({
      success: true,
      payments: paginatedPayments,
      total: filteredPayments.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payments',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
