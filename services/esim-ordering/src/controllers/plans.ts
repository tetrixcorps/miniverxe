import express from 'express';

const router = express.Router();

// Mock data plans
const dataPlans = [
  {
    id: 'plan-1gb-30d',
    name: '1GB - 30 Days',
    dataAmount: '1GB',
    duration: '30days',
    price: 9.99,
    currency: 'USD',
    region: 'US',
    features: ['data', 'roaming']
  },
  {
    id: 'plan-5gb-30d',
    name: '5GB - 30 Days',
    dataAmount: '5GB',
    duration: '30days',
    price: 19.99,
    currency: 'USD',
    region: 'US',
    features: ['data', 'roaming', 'priority']
  },
  {
    id: 'plan-10gb-30d',
    name: '10GB - 30 Days',
    dataAmount: '10GB',
    duration: '30days',
    price: 29.99,
    currency: 'USD',
    region: 'US',
    features: ['data', 'roaming', 'priority', 'unlimited']
  },
  {
    id: 'plan-unlimited-30d',
    name: 'Unlimited - 30 Days',
    dataAmount: 'unlimited',
    duration: '30days',
    price: 49.99,
    currency: 'USD',
    region: 'US',
    features: ['data', 'roaming', 'priority', 'unlimited', 'premium']
  }
];

// Get available data plans
router.get('/', async (req, res) => {
  try {
    const { region, duration, minPrice, maxPrice } = req.query;
    
    let filteredPlans = dataPlans;
    
    if (region) {
      filteredPlans = filteredPlans.filter(plan => plan.region === region);
    }
    
    if (duration) {
      filteredPlans = filteredPlans.filter(plan => plan.duration === duration);
    }
    
    if (minPrice) {
      filteredPlans = filteredPlans.filter(plan => plan.price >= Number(minPrice));
    }
    
    if (maxPrice) {
      filteredPlans = filteredPlans.filter(plan => plan.price <= Number(maxPrice));
    }
    
    res.status(200).json({
      success: true,
      plans: filteredPlans,
      total: filteredPlans.length
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      error: 'Failed to retrieve data plans',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Select a plan
router.post('/select', async (req, res) => {
  try {
    const { planId, customerId, region, duration } = req.body;
    
    if (!planId || !customerId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['planId', 'customerId']
      });
    }
    
    const plan = dataPlans.find(p => p.id === planId);
    
    if (!plan) {
      return res.status(404).json({
        error: 'Plan not found',
        planId
      });
    }
    
    // Create plan selection record
    const selection = {
      id: `selection-${Date.now()}`,
      planId,
      customerId,
      region: region || plan.region,
      duration: duration || plan.duration,
      price: plan.price,
      currency: plan.currency,
      features: plan.features,
      selectedAt: new Date().toISOString(),
      status: 'selected'
    };
    
    res.status(201).json({
      success: true,
      selection,
      plan,
      message: 'Plan selected successfully'
    });
  } catch (error) {
    console.error('Select plan error:', error);
    res.status(500).json({
      error: 'Failed to select plan',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upgrade plan
router.post('/upgrade', async (req, res) => {
  try {
    const { currentPlan, newPlan, customerId, upgradeFee } = req.body;
    
    if (!currentPlan || !newPlan || !customerId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['currentPlan', 'newPlan', 'customerId']
      });
    }
    
    const currentPlanData = dataPlans.find(p => p.id === currentPlan);
    const newPlanData = dataPlans.find(p => p.id === newPlan);
    
    if (!currentPlanData || !newPlanData) {
      return res.status(404).json({
        error: 'Plan not found',
        currentPlan,
        newPlan
      });
    }
    
    if (newPlanData.price <= currentPlanData.price) {
      return res.status(400).json({
        error: 'New plan must have higher price than current plan'
      });
    }
    
    const upgrade = {
      id: `upgrade-${Date.now()}`,
      customerId,
      currentPlan,
      newPlan,
      upgradeFee: upgradeFee || (newPlanData.price - currentPlanData.price),
      currency: newPlanData.currency,
      upgradedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    res.status(201).json({
      success: true,
      upgrade,
      message: 'Plan upgrade initiated successfully'
    });
  } catch (error) {
    console.error('Upgrade plan error:', error);
    res.status(500).json({
      error: 'Failed to upgrade plan',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get plan details
router.get('/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = dataPlans.find(p => p.id === planId);
    
    if (!plan) {
      return res.status(404).json({
        error: 'Plan not found',
        planId
      });
    }
    
    res.status(200).json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({
      error: 'Failed to retrieve plan',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
