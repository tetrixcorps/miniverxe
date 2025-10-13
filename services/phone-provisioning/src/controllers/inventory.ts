import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock inventory data
const inventory: any[] = [
  {
    id: 'inv-001',
    type: 'phone_number',
    value: '+1234567890',
    status: 'available',
    region: 'US',
    capabilities: ['voice', 'sms'],
    monthlyCost: 1.00
  },
  {
    id: 'inv-002',
    type: 'phone_number',
    value: '+1234567891',
    status: 'available',
    region: 'US',
    capabilities: ['voice', 'sms', 'mms'],
    monthlyCost: 1.50
  },
  {
    id: 'inv-003',
    type: 'device',
    model: 'iPhone 15',
    status: 'available',
    region: 'US',
    capabilities: ['esim', 'voice', 'data'],
    monthlyCost: 0.00
  }
];

// Get inventory
router.get('/', async (req, res) => {
  try {
    const { type, status, region, limit = 50, offset = 0 } = req.query;
    
    let filteredInventory = inventory;
    
    if (type) {
      filteredInventory = filteredInventory.filter(item => item.type === type);
    }
    
    if (status) {
      filteredInventory = filteredInventory.filter(item => item.status === status);
    }
    
    if (region) {
      filteredInventory = filteredInventory.filter(item => item.region === region);
    }
    
    const paginatedInventory = filteredInventory.slice(Number(offset), Number(offset) + Number(limit));
    
    res.status(200).json({
      success: true,
      inventory: paginatedInventory,
      total: filteredInventory.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      error: 'Failed to retrieve inventory',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Reserve inventory item
router.post('/reserve', async (req, res) => {
  try {
    const { itemId, customerId, duration = 24 } = req.body;
    
    if (!itemId || !customerId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['itemId', 'customerId']
      });
    }
    
    const itemIndex = inventory.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        error: 'Inventory item not found',
        itemId
      });
    }
    
    const item = inventory[itemIndex];
    
    if (item.status !== 'available') {
      return res.status(400).json({
        error: 'Item not available',
        status: item.status
      });
    }
    
    item.status = 'reserved';
    item.reservedBy = customerId;
    item.reservedAt = new Date().toISOString();
    item.reservationExpires = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();
    
    res.status(200).json({
      success: true,
      item,
      message: 'Inventory item reserved successfully'
    });
  } catch (error) {
    console.error('Reserve inventory error:', error);
    res.status(500).json({
      error: 'Failed to reserve inventory item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Release inventory item
router.post('/release', async (req, res) => {
  try {
    const { itemId, reason } = req.body;
    
    if (!itemId) {
      return res.status(400).json({
        error: 'Missing required field: itemId'
      });
    }
    
    const itemIndex = inventory.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        error: 'Inventory item not found',
        itemId
      });
    }
    
    const item = inventory[itemIndex];
    item.status = 'available';
    item.releasedAt = new Date().toISOString();
    item.releaseReason = reason;
    delete item.reservedBy;
    delete item.reservedAt;
    delete item.reservationExpires;
    
    res.status(200).json({
      success: true,
      item,
      message: 'Inventory item released successfully'
    });
  } catch (error) {
    console.error('Release inventory error:', error);
    res.status(500).json({
      error: 'Failed to release inventory item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add inventory item
router.post('/add', async (req, res) => {
  try {
    const {
      type,
      value,
      region,
      capabilities,
      monthlyCost,
      model
    } = req.body;
    
    if (!type || !region) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['type', 'region']
      });
    }
    
    const newItem = {
      id: `inv-${Date.now()}`,
      type,
      value,
      region,
      capabilities: capabilities || [],
      monthlyCost: monthlyCost || 0,
      model,
      status: 'available',
      addedAt: new Date().toISOString()
    };
    
    inventory.push(newItem);
    
    res.status(201).json({
      success: true,
      item: newItem,
      message: 'Inventory item added successfully'
    });
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({
      error: 'Failed to add inventory item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get inventory statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      total: inventory.length,
      available: inventory.filter(item => item.status === 'available').length,
      reserved: inventory.filter(item => item.status === 'reserved').length,
      byType: {
        phone_number: inventory.filter(item => item.type === 'phone_number').length,
        device: inventory.filter(item => item.type === 'device').length
      },
      byRegion: inventory.reduce((acc, item) => {
        acc[item.region] = (acc[item.region] || 0) + 1;
        return acc;
      }, {} as any)
    };
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve inventory statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
