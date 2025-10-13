import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock data store
const portingRequests: any[] = [];

// Initiate porting request
router.post('/initiate', async (req, res) => {
  try {
    const {
      currentNumber,
      currentCarrier,
      accountNumber,
      pin,
      customerId,
      billingAddress,
      authorizedUser,
      serviceAddress
    } = req.body;

    // Validate required fields
    if (!currentNumber || !currentCarrier || !accountNumber || !customerId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['currentNumber', 'currentCarrier', 'accountNumber', 'customerId']
      });
    }

    // Create porting request
    const portingRequest = {
      id: uuidv4(),
      currentNumber,
      currentCarrier,
      accountNumber,
      pin,
      customerId,
      billingAddress,
      authorizedUser,
      serviceAddress,
      status: 'pending',
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    portingRequests.push(portingRequest);

    res.status(201).json({
      success: true,
      portingRequest,
      message: 'Porting request initiated successfully'
    });
  } catch (error) {
    console.error('Initiate porting error:', error);
    res.status(500).json({
      error: 'Failed to initiate porting request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get porting status
router.get('/:requestId/status', async (req, res) => {
  try {
    const { requestId } = req.params;
    const portingRequest = portingRequests.find(pr => pr.id === requestId);
    
    if (!portingRequest) {
      return res.status(404).json({
        error: 'Porting request not found',
        requestId
      });
    }
    
    res.status(200).json({
      success: true,
      portingRequest: {
        id: portingRequest.id,
        currentNumber: portingRequest.currentNumber,
        status: portingRequest.status,
        estimatedCompletion: portingRequest.estimatedCompletion,
        createdAt: portingRequest.createdAt,
        updatedAt: portingRequest.updatedAt
      }
    });
  } catch (error) {
    console.error('Get porting status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve porting status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update porting request
router.put('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, notes, rejectionReason } = req.body;
    
    const requestIndex = portingRequests.findIndex(pr => pr.id === requestId);
    
    if (requestIndex === -1) {
      return res.status(404).json({
        error: 'Porting request not found',
        requestId
      });
    }
    
    const portingRequest = portingRequests[requestIndex];
    
    if (status) portingRequest.status = status;
    if (notes) portingRequest.notes = notes;
    if (rejectionReason) portingRequest.rejectionReason = rejectionReason;
    
    if (status === 'completed') {
      portingRequest.completedAt = new Date().toISOString();
    } else if (status === 'rejected') {
      portingRequest.rejectedAt = new Date().toISOString();
    }
    
    portingRequest.updatedAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      portingRequest,
      message: 'Porting request updated successfully'
    });
  } catch (error) {
    console.error('Update porting request error:', error);
    res.status(500).json({
      error: 'Failed to update porting request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cancel porting request
router.post('/:requestId/cancel', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    
    const requestIndex = portingRequests.findIndex(pr => pr.id === requestId);
    
    if (requestIndex === -1) {
      return res.status(404).json({
        error: 'Porting request not found',
        requestId
      });
    }
    
    const portingRequest = portingRequests[requestIndex];
    
    if (portingRequest.status === 'completed') {
      return res.status(400).json({
        error: 'Cannot cancel completed porting request'
      });
    }
    
    portingRequest.status = 'cancelled';
    portingRequest.cancellationReason = reason;
    portingRequest.cancelledAt = new Date().toISOString();
    portingRequest.updatedAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      portingRequest,
      message: 'Porting request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel porting request error:', error);
    res.status(500).json({
      error: 'Failed to cancel porting request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get customer porting requests
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;
    
    let filteredRequests = portingRequests.filter(pr => pr.customerId === customerId);
    
    if (status) {
      filteredRequests = filteredRequests.filter(pr => pr.status === status);
    }
    
    const paginatedRequests = filteredRequests.slice(Number(offset), Number(offset) + Number(limit));
    
    res.status(200).json({
      success: true,
      portingRequests: paginatedRequests,
      total: filteredRequests.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Get customer porting requests error:', error);
    res.status(500).json({
      error: 'Failed to retrieve customer porting requests',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all porting requests
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let filteredRequests = portingRequests;
    
    if (status) {
      filteredRequests = filteredRequests.filter(pr => pr.status === status);
    }
    
    const paginatedRequests = filteredRequests.slice(Number(offset), Number(offset) + Number(limit));
    
    res.status(200).json({
      success: true,
      portingRequests: paginatedRequests,
      total: filteredRequests.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Get porting requests error:', error);
    res.status(500).json({
      error: 'Failed to retrieve porting requests',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
