# Zoho RPA Agent Setup Guide

## 🚀 Overview

This guide will help you set up the Zoho RPA Agent integration for the TETRIX Enhanced RPA Platform. The Zoho RPA integration enables desktop automation, web automation, and hybrid automation workflows.

## 📋 Prerequisites

1. **Zoho RPA Account**: You need an active Zoho RPA account with API access
2. **Node.js 18+**: Required for running the TETRIX RPA platform
3. **Zoho RPA Workspace**: A workspace ID from your Zoho RPA account
4. **API Credentials**: Client ID and Client Secret from Zoho RPA API settings

## 🔧 Step 1: Obtain Zoho RPA API Credentials

### 1.1 Access Zoho RPA Developer Console

1. Log in to your Zoho account
2. Navigate to [Zoho Developer Console](https://api-console.zoho.com/)
3. Create a new application or use an existing one

### 1.2 Generate API Credentials

1. In the Developer Console, select your application
2. Navigate to **Client Details**
3. Copy the following:
   - **Client ID**
   - **Client Secret**
4. Note your **Workspace ID** from the Zoho RPA dashboard

### 1.3 Generate Access Token

You can generate an access token using one of these methods:

#### Method 1: OAuth 2.0 Authorization Code Flow

```bash
# Step 1: Get authorization code
# Visit this URL in your browser (replace CLIENT_ID with your actual client ID):
https://accounts.zoho.com/oauth/v2/auth?scope=ZohoRPA.bot.ALL,ZohoRPA.workflow.ALL&client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI

# Step 2: Exchange authorization code for tokens
curl -X POST https://accounts.zoho.com/oauth/v2/token \
  -d "grant_type=authorization_code" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=YOUR_REDIRECT_URI" \
  -d "code=AUTHORIZATION_CODE"
```

#### Method 2: Client Credentials Flow (Server-to-Server)

```bash
curl -X POST https://accounts.zoho.com/oauth/v2/token \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "scope=ZohoRPA.bot.ALL,ZohoRPA.workflow.ALL"
```

## 📁 Step 2: Navigate to Desktop Directory

```bash
cd /home/diegomartinez/Desktop/
```

## ⚙️ Step 3: Configure Environment Variables

1. Copy the environment template:

```bash
cd /home/diegomartinez/Desktop/tetrix/rpa
cp .env.example .env
```

2. Edit the `.env` file and add your Zoho RPA credentials:

```bash
nano .env
# or
vim .env
```

3. Update the following variables:

```env
ZOHO_RPA_CLIENT_ID=your_actual_client_id
ZOHO_RPA_CLIENT_SECRET=your_actual_client_secret
ZOHO_RPA_ACCESS_TOKEN=your_access_token
ZOHO_RPA_REFRESH_TOKEN=your_refresh_token
ZOHO_RPA_WORKSPACE_ID=your_workspace_id
```

## 🔌 Step 4: Install Dependencies

```bash
cd /home/diegomartinez/Desktop/tetrix/rpa
npm install
# or if using pnpm
pnpm install
```

## 🧪 Step 5: Test the Integration

Create a test script to verify the Zoho RPA integration:

```typescript
// test-zoho-rpa.ts
import { TETRIXZohoRPAIntegrationService } from './src/services/zohoRpaIntegrationService';

async function testZohoRPA() {
  const clientId = process.env.ZOHO_RPA_CLIENT_ID!;
  const clientSecret = process.env.ZOHO_RPA_CLIENT_SECRET!;
  const accessToken = process.env.ZOHO_RPA_ACCESS_TOKEN;
  const refreshToken = process.env.ZOHO_RPA_REFRESH_TOKEN;

  const zohoRpaService = new TETRIXZohoRPAIntegrationService(
    clientId,
    clientSecret,
    accessToken,
    refreshToken
  );

  try {
    // Test API connection
    console.log('Testing Zoho RPA connection...');
    
    // Create a test bot
    const testBot = await zohoRpaService.createBot({
      workspaceId: process.env.ZOHO_RPA_WORKSPACE_ID!,
      botName: 'test_bot',
      automationType: 'desktop',
      workflowSteps: [],
      errorHandling: {
        retryAttempts: 3,
        retryDelay: 5000,
        fallbackAction: 'notify_admin',
        notificationEnabled: true,
        escalation: {
          enabled: true,
          threshold: 3,
          notificationChannels: ['email'],
          escalationLevels: []
        },
        errorLogging: true
      },
      monitoring: {
        enabled: true,
        metrics: ['execution_time', 'success_rate'],
        alerts: [],
        reporting: {
          enabled: true,
          frequency: 'daily',
          format: 'json',
          recipients: [],
          metrics: []
        },
        realTimeMonitoring: false
      },
      variables: []
    }, 'test');

    console.log('✅ Zoho RPA integration test successful!');
    console.log('Bot ID:', testBot.id);
  } catch (error) {
    console.error('❌ Zoho RPA integration test failed:', error);
  }
}

testZohoRPA();
```

Run the test:

```bash
npx ts-node test-zoho-rpa.ts
```

## 🎯 Step 6: Initialize Zoho RPA Service in Your Application

```typescript
import { TETRIXZohoRPAIntegrationService } from './rpa/src/services/zohoRpaIntegrationService';
import { TETRIXEnhancedWorkflowEngine } from './rpa/src/services/enhancedWorkflowEngine';
import { TETRIXRPAEngine } from './rpa/src/services/rpaEngine';

// Initialize services
const rpaEngine = new TETRIXRPAEngine();
const zohoRpaService = new TETRIXZohoRPAIntegrationService(
  process.env.ZOHO_RPA_CLIENT_ID!,
  process.env.ZOHO_RPA_CLIENT_SECRET!,
  process.env.ZOHO_RPA_ACCESS_TOKEN,
  process.env.ZOHO_RPA_REFRESH_TOKEN
);

// Initialize enhanced workflow engine with Zoho RPA support
const enhancedWorkflowEngine = new TETRIXEnhancedWorkflowEngine(
  rpaEngine,
  undefined, // Axiom service (optional)
  zohoRpaService // Zoho RPA service
);
```

## 📝 Step 7: Create Your First Zoho RPA Workflow

```typescript
import { EnhancedWorkflowConfig } from './rpa/src/services/enhancedWorkflowEngine';

const workflowConfig: EnhancedWorkflowConfig = {
  name: 'Sample Desktop Automation',
  description: 'Automates a desktop application task',
  industry: 'general',
  steps: [],
  zohoRpa: {
    workspaceId: process.env.ZOHO_RPA_WORKSPACE_ID!,
    automationType: 'desktop',
    targetApplication: 'Notepad',
    workflowSteps: [
      {
        id: 'step1',
        name: 'Open Application',
        type: 'navigate',
        target: 'notepad.exe',
        delay: 2000
      },
      {
        id: 'step2',
        name: 'Type Text',
        type: 'type',
        target: 'textarea',
        value: 'Hello from Zoho RPA!',
        delay: 1000
      }
    ]
  }
};

const workflow = await enhancedWorkflowEngine.createEnhancedWorkflow('general', workflowConfig);
console.log('Created workflow:', workflow.id);
```

## 🔐 Security Best Practices

1. **Never commit credentials**: Ensure `.env` is in `.gitignore`
2. **Use environment variables**: Always use environment variables for sensitive data
3. **Rotate tokens regularly**: Refresh access tokens before they expire
4. **Limit API scope**: Only request necessary scopes for your use case
5. **Enable audit logging**: Keep audit logs for compliance requirements

## 🐛 Troubleshooting

### Issue: Authentication Failed

**Solution**: 
- Verify your Client ID and Client Secret are correct
- Check if your access token has expired
- Ensure you have the correct API scopes

### Issue: Workspace Not Found

**Solution**:
- Verify your Workspace ID is correct
- Ensure you have access to the workspace in Zoho RPA dashboard

### Issue: Bot Creation Failed

**Solution**:
- Check your API permissions
- Verify your workspace has available bot slots
- Review error messages in the console

## 📚 Additional Resources

- [Zoho RPA API Documentation](https://www.zoho.com/rpa/api/)
- [Zoho Developer Console](https://api-console.zoho.com/)
- [TETRIX RPA Platform Documentation](./README.md)

## ✅ Verification Checklist

- [ ] Zoho RPA API credentials obtained
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Integration test passed
- [ ] First workflow created successfully
- [ ] Security best practices implemented

## 🆘 Support

For additional support:
- Email: support@tetrix.com
- Documentation: [TETRIX Docs](https://docs.tetrix.com)
- GitHub Issues: [Report an Issue](https://github.com/tetrix/rpa-platform/issues)

---

**Last Updated**: 2024
**Version**: 1.0.0

