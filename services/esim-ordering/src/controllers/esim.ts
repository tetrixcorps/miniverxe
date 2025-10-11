import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock data store (in production, use a database)
const esims: any[] = [];

// Activate eSIM
router.post('/activate', async (req, res) => {
  try {
    const {
      orderId,
      esimId,
      activationCode,
      deviceInfo
    } = req.body;

    // Validate required fields
    if (!orderId || !esimId || !activationCode) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['orderId', 'esimId', 'activationCode']
      });
    }

    // Create eSIM record
    const esim = {
      id: esimId,
      orderId,
      activationCode,
      deviceInfo,
      status: 'activated',
      activatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    esims.push(esim);

    res.status(201).json({
      success: true,
      esim,
      message: 'eSIM activated successfully'
    });
  } catch (error) {
    console.error('eSIM activation error:', error);
    res.status(500).json({
      error: 'Failed to activate eSIM',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Deactivate eSIM
router.post('/deactivate', async (req, res) => {
  try {
    const { esimId, reason } = req.body;

    if (!esimId) {
      return res.status(400).json({
        error: 'Missing required field: esimId'
      });
    }

    const esimIndex = esims.findIndex(e => e.id === esimId);
    
    if (esimIndex === -1) {
      return res.status(404).json({
        error: 'eSIM not found',
        esimId
      });
    }

    const esim = esims[esimIndex];
    esim.status = 'deactivated';
    esim.deactivationReason = reason;
    esim.deactivatedAt = new Date().toISOString();
    esim.updatedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      esim,
      message: 'eSIM deactivated successfully'
    });
  } catch (error) {
    console.error('eSIM deactivation error:', error);
    res.status(500).json({
      error: 'Failed to deactivate eSIM',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get eSIM status
router.get('/:esimId/status', async (req, res) => {
  try {
    const { esimId } = req.params;
    const esim = esims.find(e => e.id === esimId);
    
    if (!esim) {
      return res.status(404).json({
        error: 'eSIM not found',
        esimId
      });
    }
    
    res.status(200).json({
      success: true,
      esim: {
        id: esim.id,
        status: esim.status,
        activatedAt: esim.activatedAt,
        deactivatedAt: esim.deactivatedAt,
        deviceInfo: esim.deviceInfo
      }
    });
  } catch (error) {
    console.error('Get eSIM status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve eSIM status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Download eSIM profile
router.post('/download', async (req, res) => {
  try {
    const { esimId, deviceInfo } = req.body;

    if (!esimId) {
      return res.status(400).json({
        error: 'Missing required field: esimId'
      });
    }

    const esim = esims.find(e => e.id === esimId);
    
    if (!esim) {
      return res.status(404).json({
        error: 'eSIM not found',
        esimId
      });
    }

    if (esim.status !== 'activated') {
      return res.status(400).json({
        error: 'eSIM not activated',
        status: esim.status
      });
    }

    // Generate mock eSIM profile
    const profile = {
      esimId,
      profileId: uuidv4(),
      iccid: `89${Math.random().toString().slice(2, 20)}`,
      downloadUrl: `https://api.tetrixcorp.com/esim/download/${esimId}`,
      qrCode: `LPA:1$rsp-prod.ondemandconnectivity.com$${uuidv4()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      deviceInfo
    };

    res.status(200).json({
      success: true,
      profile,
      message: 'eSIM profile generated successfully'
    });
  } catch (error) {
    console.error('eSIM download error:', error);
    res.status(500).json({
      error: 'Failed to generate eSIM profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all eSIMs
router.get('/', async (req, res) => {
  try {
    const { orderId, status, limit = 50, offset = 0 } = req.query;
    
    let filteredEsims = esims;
    
    if (orderId) {
      filteredEsims = filteredEsims.filter(esim => esim.orderId === orderId);
    }
    
    if (status) {
      filteredEsims = filteredEsims.filter(esim => esim.status === status);
    }
    
    const paginatedEsims = filteredEsims.slice(Number(offset), Number(offset) + Number(limit));
    
    res.status(200).json({
      success: true,
      esims: paginatedEsims,
      total: filteredEsims.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Get eSIMs error:', error);
    res.status(500).json({
      error: 'Failed to retrieve eSIMs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
