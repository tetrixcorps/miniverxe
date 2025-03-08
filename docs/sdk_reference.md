# AI-Enhanced Microservices Platform - SDK Reference

This document provides a complete reference for both the JavaScript/TypeScript and Python SDKs.

## JavaScript/TypeScript SDK

### Installation 

npm install ai-platform-client

### Core Classes

#### ApiClient

The main client class for interacting with the API.

```typescript
import { ApiClient } from 'ai-platform-client';

// Create a client instance
const client = new ApiClient(baseUrl, options);
```

**Constructor Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| baseUrl | string | Base URL for the API (e.g., "https://api.example.com/v1") |
| options | object | Configuration options |
| options.apiKey | string | (Optional) API key for authentication |
| options.authToken | string | (Optional) JWT token for authentication |
| options.timeout | number | (Optional) Request timeout in milliseconds (default: 30000) |
| options.debug | boolean | (Optional) Enable debug logging (default: false) |
| options.logLevel | string | (Optional) Log level ('error', 'warn', 'info', 'debug', 'verbose') |
| options.offlineOptions | object | (Optional) Configuration for offline mode |

**Methods**:

| Method | Description | Parameters | Return Type |
|--------|-------------|------------|-------------|
| login | Authenticate user and get token | username: string, password: string | Promise<AuthResult> |
| setAuthToken | Set JWT token for requests | token: string | void |
| getUser | Get current user info | - | Promise<User> |
| transcribeAudio | Transcribe an audio file | file: File/Blob, options?: Object | Promise<TranscriptionResult> |
| createStreamingSession | Create WebSocket streaming session | options?: Object | Promise<StreamingSession> |
| analyzeImage | Analyze an image | file: File/Blob, options?: Object | Promise<VisionAnalysisResult> |
| enhanceMedia | Enhance an image | file: File/Blob, options?: Object | Promise<BackgroundTask> |
| getTaskStatus | Get status of background task | taskId: string | Promise<TaskStatus> |
| listTasks | List background tasks | params?: Object | Promise<TaskList> |
| analyzeCampaign | Analyze marketing campaign | data: Object | Promise<BackgroundTask> |
| scoreLead | Score a marketing lead | data: Object | Promise<LeadScore> |
| registerMarketingWebhook | Register webhook | config: Object | Promise<WebhookResult> |
| analyzeSalesCall | Analyze a sales call recording | data: Object | Promise<BackgroundTask> |
| syncOpportunity | Sync opportunity with CRM | data: Object | Promise<SyncResult> |
| getOpportunityRecommendations | Get recommendations for opportunity | opportunityId: string | Promise<Recommendations> |
| createCall | Create a VOIP call | options: Object | Promise<CallSetup> |
| endCall | End a VOIP call | callId: string | Promise<CallEnd> |
| getCallAnalytics | Get analytics for a call | callId: string | Promise<CallAnalytics> |
| getVoipWebSocketUrl | Get WebSocket URL for VOIP | callId: string | string |
| isOffline | Check if client is in offline mode | - | boolean |
| getPendingActionCount | Get count of pending offline actions | - | number |
| getLastSyncTime | Get last offline sync timestamp | - | number |
| forceSync | Force synchronization of offline queue | - | Promise<SyncResult> |
| get | General GET request | path: string, params?: Object, config?: Object | Promise<any> |
| post | General POST request | path: string, data?: Object, config?: Object | Promise<any> |
| put | General PUT request | path: string, data?: Object, config?: Object | Promise<any> |
| delete | General DELETE request | path: string, config?: Object | Promise<any> |

### Events

The client emits the following events:

```typescript
// Listen for events
client.on('log', (level, message, data) => {
  console.log(`[${level}] ${message}`, data);
});

client.on('offline', (isOffline) => {
  console.log(`Offline status changed: ${isOffline}`);
});

client.on('sync', (success, count) => {
  console.log(`Sync ${success ? 'completed' : 'failed'}: ${count} items`);
});
```

### Types

#### AuthResult

```typescript
interface AuthResult {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: User;
}
```

#### User

```typescript
interface User {
  id: string;
  username: string;
  name: string;
  company?: string;
  roles: string[];
  subscription?: {
    plan: string;
    expires_at: string;
  };
}
```

#### TranscriptionResult

```typescript
interface TranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
  language: string;
  duration: number;
  word_count: number;
}

interface TranscriptionSegment {
  id: string;
  start_time: number;
  end_time: number;
  text: string;
  speaker?: string;
  confidence: number;
}
```

#### StreamingSession

```typescript
interface StreamingSession {
  session_id: string;
  websocket_url: string;
  expires_in: number;
}
```

#### VisionAnalysisResult

```typescript
interface VisionAnalysisResult {
  objects: {
    label: string;
    confidence: number;
    bounding_box: number[];
  }[];
  faces: {
    bounding_box: number[];
    landmarks: Record<string, number[]>;
    attributes: {
      gender?: string;
      age?: number;
      emotion?: string;
    };
  }[];
  text: {
    text: string;
    bounding_box: number[];
    confidence: number;
  }[];
}
```

#### BackgroundTask

```typescript
interface BackgroundTask {
  task_id: string;
  status: 'created' | 'processing' | 'completed' | 'failed';
  estimated_time?: number;
  status_url: string;
}
```

#### TaskStatus

```typescript
interface TaskStatus {
  task_id: string;
  status: 'created' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  created_at: string;
  completed_at?: string;
}
```

#### TaskList

```typescript
interface TaskList {
  tasks: {
    task_id: string;
    status: string;
    type: string;
    progress: number;
    created_at: string;
    completed_at?: string;
  }[];
  total: number;
  limit: number;
  offset: number;
}
```

#### LeadScore

```typescript
interface LeadScore {
  score: number;
  quality: 'low' | 'medium' | 'high';
  recommended_action: string;
}
```

#### WebhookResult

```typescript
interface WebhookResult {
  webhook_id: string;
  status: 'active' | 'inactive';
  created_at: string;
}
```

#### SyncResult

```typescript
interface SyncResult {
  success: boolean;
  items_synced: number;
  errors?: {
    item_id: string;
    error: string;
  }[];
}
```

#### CallSetup

```typescript
interface CallSetup {
  call_id: string;
  status: 'initiated';
  caller_id: string;
  callee_id: string;
  websocket_url: string;
  created_at: string;
}
```

#### CallEnd

```typescript
interface CallEnd {
  call_id: string;
  status: 'ended';
  duration: number;
  ended_at: string;
}
```

#### CallAnalytics

```typescript
interface CallAnalytics {
  call_id: string;
  duration: number;
  participants: string[];
  transcription: string;
  sentiment: {
    overall: string;
    score: number;
  };
  topics: string[];
  action_items: string[];
  summary: string;
}
```

### Offline Options

Configure offline behavior for scenarios with limited connectivity: