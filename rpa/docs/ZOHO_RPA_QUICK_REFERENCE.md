# Zoho RPA Quick Reference Guide

## 🚀 Quick Start

### 1. Configuration

```bash
# Set API key in config file
echo "ZOHO_RPA_API_KEY=your_api_key_here" >> config/zoho-rpa.env

# Or set as environment variable
export ZOHO_RPA_API_KEY=your_api_key_here
```

### 2. Initialize Service

```typescript
import { TETRIXZohoRPAIntegrationService } from './services/zohoRpaIntegrationService';

const apiKey = process.env.ZOHO_RPA_API_KEY || import.meta.env.ZOHO_RPA_API_KEY;
const zohoRpaService = new TETRIXZohoRPAIntegrationService(apiKey);
```

### 3. Create Bot

```typescript
const bot = await zohoRpaService.createBot({
  workspaceId: 'your-workspace-id',
  botName: 'My Bot',
  automationType: 'web', // 'desktop' | 'web' | 'hybrid'
  workflowSteps: [
    {
      id: 'step1',
      name: 'Navigate',
      type: 'navigate',
      target: 'https://example.com'
    }
  ],
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 1000,
    fallbackAction: 'log',
    notificationEnabled: false,
    escalation: { enabled: false, threshold: 5, notificationChannels: [], escalationLevels: [] },
    errorLogging: true
  },
  monitoring: {
    enabled: true,
    metrics: ['execution_time', 'success_rate'],
    alerts: [],
    reporting: { enabled: false, frequency: 'daily', format: 'json', recipients: [], metrics: [] },
    realTimeMonitoring: false
  },
  variables: []
}, 'healthcare');
```

### 4. Execute Workflow

```typescript
const execution = await zohoRpaService.executeWorkflow(
  bot.id,
  'workflow-id',
  { variable1: 'value1' }
);

// Check status
const status = await zohoRpaService.getExecutionStatus(execution.id);
```

### 5. Get Metrics

```typescript
const metrics = await zohoRpaService.getBotMetrics(bot.id);
console.log(`Success Rate: ${metrics.successRate}%`);
console.log(`Executions: ${metrics.executions}`);
```

---

## 📋 Common Patterns

### Dashboard Integration

```typescript
// In dashboard initialization
class EnhancedRPADashboard {
  constructor() {
    const zohoRpaApiKey = import.meta.env.ZOHO_RPA_API_KEY;
    if (zohoRpaApiKey) {
      this.zohoRpaService = new TETRIXZohoRPAIntegrationService(zohoRpaApiKey);
    }
  }
  
  async loadIndustryBots(industry: string) {
    if (this.zohoRpaService) {
      return await this.zohoRpaService.getIndustryBots(industry);
    }
    return [];
  }
}
```

### Error Handling

```typescript
try {
  const bot = await zohoRpaService.createBot(config, industry);
} catch (error) {
  if (error.message.includes('authentication')) {
    // Handle auth error
  } else if (error.message.includes('workspace')) {
    // Handle workspace error
  } else {
    // Handle generic error
  }
}
```

### Hybrid Workflow

```typescript
// Create workflow with multiple integrations
const workflow = await enhancedWorkflowEngine.createEnhancedWorkflow('healthcare', {
  // Traditional RPA
  rpa: { /* config */ },
  
  // Browser automation (Axiom.ai)
  browserAutomation: { /* config */ },
  
  // Zoho RPA
  zohoRpa: {
    workspaceId: 'workspace-123',
    automationType: 'hybrid',
    workflowSteps: [ /* steps */ ]
  }
});
```

---

## 🔧 API Reference

### Bot Management

| Method | Description | Returns |
|--------|-------------|---------|
| `createBot(config, industry)` | Create new bot | `ZohoRPABot` |
| `getIndustryBots(industry)` | Get bots for industry | `ZohoRPABot[]` |
| `updateBotConfiguration(botId, config)` | Update bot config | `ZohoRPABot` |
| `deleteBot(botId)` | Delete bot | `void` |
| `getBotMetrics(botId)` | Get bot performance | `ZohoRPAMetrics` |

### Workflow Execution

| Method | Description | Returns |
|--------|-------------|---------|
| `executeWorkflow(botId, workflowId, variables?)` | Execute workflow | `ZohoWorkflowExecution` |
| `getExecutionStatus(executionId)` | Get execution status | `ZohoWorkflowExecution` |

---

## 🎨 UI Components

### Bot Badge

```astro
{bot.zohoRpaIntegration && (
  <span class="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Zoho</span>
)}
```

### Metrics Display

```astro
<div class="flex justify-between text-sm">
  <span class="text-gray-600">Zoho Executions:</span>
  <span class="font-medium">{zohoMetrics.totalExecutions}</span>
</div>
<div class="flex justify-between text-sm">
  <span class="text-gray-600">Zoho Success Rate:</span>
  <span class="font-medium text-green-600">{zohoMetrics.successRate}%</span>
</div>
```

---

## 🔐 Compliance Settings

### Healthcare

```typescript
{
  dataPrivacy: true,
  encryption: true,
  auditLogging: true,
  hipaaCompliance: true,
  dataRetention: 365 // days
}
```

### Financial

```typescript
{
  dataPrivacy: true,
  encryption: true,
  auditLogging: true,
  soxCompliance: true,
  dataRetention: 2555 // 7 years
}
```

### General

```typescript
{
  dataPrivacy: true,
  encryption: true,
  auditLogging: true,
  gdprCompliance: true,
  dataRetention: 90 // days
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Service not initializing | Check `ZOHO_RPA_API_KEY` is set |
| Bots not loading | Verify workspace ID and API permissions |
| Bot creation fails | Check compliance requirements for industry |
| Execution fails | Verify workflow steps and bot configuration |
| Metrics not updating | Check real-time monitoring is enabled |

---

## 📞 Support

- **Documentation**: `/rpa/docs/ZOHO_RPA_DASHBOARD_INTEGRATION_GUIDE.md`
- **Setup Guide**: `/rpa/ZOHO_RPA_SETUP.md`
- **Integration Summary**: `/rpa/docs/ZOHO_RPA_INTEGRATION_SUMMARY.md`
- **Zoho RPA API**: https://www.zoho.com/rpa/api/

---

**Last Updated**: November 30, 2024

