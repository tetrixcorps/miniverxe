import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock data store
const provisioningJobs: any[] = [];

// Create provisioning job
router.post('/job', async (req, res) => {
  try {
    const {
      customerId,
      phoneNumber,
      deviceType,
      deviceId,
      configuration,
      priority = 'normal'
    } = req.body;

    // Validate required fields
    if (!customerId || !phoneNumber || !deviceType) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['customerId', 'phoneNumber', 'deviceType']
      });
    }

    // Create provisioning job
    const job = {
      id: uuidv4(),
      customerId,
      phoneNumber,
      deviceType,
      deviceId,
      configuration,
      priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    };

    provisioningJobs.push(job);

    // Simulate job processing
    setTimeout(() => {
      const jobIndex = provisioningJobs.findIndex(j => j.id === job.id);
      if (jobIndex !== -1) {
        provisioningJobs[jobIndex].status = 'completed';
        provisioningJobs[jobIndex].completedAt = new Date().toISOString();
        provisioningJobs[jobIndex].updatedAt = new Date().toISOString();
      }
    }, 5000);

    res.status(201).json({
      success: true,
      job,
      message: 'Provisioning job created successfully'
    });
  } catch (error) {
    console.error('Create provisioning job error:', error);
    res.status(500).json({
      error: 'Failed to create provisioning job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get job status
router.get('/job/:jobId/status', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = provisioningJobs.find(j => j.id === jobId);
    
    if (!job) {
      return res.status(404).json({
        error: 'Provisioning job not found',
        jobId
      });
    }
    
    res.status(200).json({
      success: true,
      job: {
        id: job.id,
        customerId: job.customerId,
        phoneNumber: job.phoneNumber,
        deviceType: job.deviceType,
        status: job.status,
        priority: job.priority,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        estimatedCompletion: job.estimatedCompletion
      }
    });
  } catch (error) {
    console.error('Get job status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve job status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update job status
router.put('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, progress, notes, errorMessage } = req.body;
    
    const jobIndex = provisioningJobs.findIndex(j => j.id === jobId);
    
    if (jobIndex === -1) {
      return res.status(404).json({
        error: 'Provisioning job not found',
        jobId
      });
    }
    
    const job = provisioningJobs[jobIndex];
    
    if (status) job.status = status;
    if (progress !== undefined) job.progress = progress;
    if (notes) job.notes = notes;
    if (errorMessage) job.errorMessage = errorMessage;
    
    if (status === 'completed') {
      job.completedAt = new Date().toISOString();
    } else if (status === 'failed') {
      job.failedAt = new Date().toISOString();
    }
    
    job.updatedAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      job,
      message: 'Provisioning job updated successfully'
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      error: 'Failed to update provisioning job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cancel job
router.post('/job/:jobId/cancel', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { reason } = req.body;
    
    const jobIndex = provisioningJobs.findIndex(j => j.id === jobId);
    
    if (jobIndex === -1) {
      return res.status(404).json({
        error: 'Provisioning job not found',
        jobId
      });
    }
    
    const job = provisioningJobs[jobIndex];
    
    if (job.status === 'completed') {
      return res.status(400).json({
        error: 'Cannot cancel completed job'
      });
    }
    
    job.status = 'cancelled';
    job.cancellationReason = reason;
    job.cancelledAt = new Date().toISOString();
    job.updatedAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      job,
      message: 'Provisioning job cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel job error:', error);
    res.status(500).json({
      error: 'Failed to cancel provisioning job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get customer jobs
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;
    
    let filteredJobs = provisioningJobs.filter(j => j.customerId === customerId);
    
    if (status) {
      filteredJobs = filteredJobs.filter(j => j.status === status);
    }
    
    const paginatedJobs = filteredJobs.slice(Number(offset), Number(offset) + Number(limit));
    
    res.status(200).json({
      success: true,
      jobs: paginatedJobs,
      total: filteredJobs.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Get customer jobs error:', error);
    res.status(500).json({
      error: 'Failed to retrieve customer jobs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all jobs
router.get('/jobs', async (req, res) => {
  try {
    const { status, priority, limit = 50, offset = 0 } = req.query;
    
    let filteredJobs = provisioningJobs;
    
    if (status) {
      filteredJobs = filteredJobs.filter(j => j.status === status);
    }
    
    if (priority) {
      filteredJobs = filteredJobs.filter(j => j.priority === priority);
    }
    
    const paginatedJobs = filteredJobs.slice(Number(offset), Number(offset) + Number(limit));
    
    res.status(200).json({
      success: true,
      jobs: paginatedJobs,
      total: filteredJobs.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      error: 'Failed to retrieve provisioning jobs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
