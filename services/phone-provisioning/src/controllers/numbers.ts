import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock data store
const phoneNumbers: any[] = [];

// Search available numbers
router.get('/search', async (req, res) => {
  try {
    const { 
      areaCode, 
      country = 'US', 
      type = 'local',
      limit = 10 
    } = req.query;

    // Mock available numbers
    const availableNumbers = Array.from({ length: Number(limit) }, (_, i) => ({
      id: uuidv4(),
      number: `+1${areaCode}${Math.floor(Math.random() * 9000000) + 1000000}`,
      areaCode,
      country,
      type,
      capabilities: ['voice', 'sms', 'mms'],
      monthlyPrice: 1.00,
      setupPrice: 0.00,
      available: true
    }));

    res.status(200).json({
      success: true,
      numbers: availableNumbers,
      total: availableNumbers.length
    });
  } catch (error) {
    console.error('Search numbers error:', error);
    res.status(500).json({
      error: 'Failed to search numbers',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Purchase number
router.post('/purchase', async (req, res) => {
  try {
    const {
      number,
      customerId,
      billingAddress,
      voiceUrl,
      smsUrl
    } = req.body;

    // Validate required fields
    if (!number || !customerId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['number', 'customerId']
      });
    }

    // Create phone number record
    const phoneNumber = {
      id: uuidv4(),
      number,
      customerId,
      billingAddress,
      voiceUrl,
      smsUrl,
      status: 'active',
      purchasedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    phoneNumbers.push(phoneNumber);

    res.status(201).json({
      success: true,
      phoneNumber,
      message: 'Phone number purchased successfully'
    });
  } catch (error) {
    console.error('Purchase number error:', error);
    res.status(500).json({
      error: 'Failed to purchase number',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get customer numbers
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;
    
    let filteredNumbers = phoneNumbers.filter(pn => pn.customerId === customerId);
    
    if (status) {
      filteredNumbers = filteredNumbers.filter(pn => pn.status === status);
    }
    
    const paginatedNumbers = filteredNumbers.slice(Number(offset), Number(offset) + Number(limit));
    
    res.status(200).json({
      success: true,
      numbers: paginatedNumbers,
      total: filteredNumbers.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Get customer numbers error:', error);
    res.status(500).json({
      error: 'Failed to retrieve customer numbers',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update number configuration
router.put('/:numberId', async (req, res) => {
  try {
    const { numberId } = req.params;
    const { voiceUrl, smsUrl, status } = req.body;
    
    const numberIndex = phoneNumbers.findIndex(pn => pn.id === numberId);
    
    if (numberIndex === -1) {
      return res.status(404).json({
        error: 'Phone number not found',
        numberId
      });
    }
    
    const phoneNumber = phoneNumbers[numberIndex];
    
    if (voiceUrl) phoneNumber.voiceUrl = voiceUrl;
    if (smsUrl) phoneNumber.smsUrl = smsUrl;
    if (status) phoneNumber.status = status;
    
    phoneNumber.updatedAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      phoneNumber,
      message: 'Phone number updated successfully'
    });
  } catch (error) {
    console.error('Update number error:', error);
    res.status(500).json({
      error: 'Failed to update phone number',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Release number
router.post('/:numberId/release', async (req, res) => {
  try {
    const { numberId } = req.params;
    const { reason } = req.body;
    
    const numberIndex = phoneNumbers.findIndex(pn => pn.id === numberId);
    
    if (numberIndex === -1) {
      return res.status(404).json({
        error: 'Phone number not found',
        numberId
      });
    }
    
    const phoneNumber = phoneNumbers[numberIndex];
    phoneNumber.status = 'released';
    phoneNumber.releaseReason = reason;
    phoneNumber.releasedAt = new Date().toISOString();
    phoneNumber.updatedAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      phoneNumber,
      message: 'Phone number released successfully'
    });
  } catch (error) {
    console.error('Release number error:', error);
    res.status(500).json({
      error: 'Failed to release phone number',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get number details
router.get('/:numberId', async (req, res) => {
  try {
    const { numberId } = req.params;
    const phoneNumber = phoneNumbers.find(pn => pn.id === numberId);
    
    if (!phoneNumber) {
      return res.status(404).json({
        error: 'Phone number not found',
        numberId
      });
    }
    
    res.status(200).json({
      success: true,
      phoneNumber
    });
  } catch (error) {
    console.error('Get number error:', error);
    res.status(500).json({
      error: 'Failed to retrieve phone number',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
