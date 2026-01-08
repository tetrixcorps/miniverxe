# Call Center Implementation Summary

## Overview

A complete Call Center system has been implemented for the TETRIX platform, based on the Telnyx Call Center architecture. The implementation is fully integrated with the existing compliance engine, IVR services, and infrastructure.

## Architecture

### Core Services

1. **CallCenterService** (`src/services/callCenter/callCenterService.ts`)
   - Manages call routing to multiple agents
   - Generates TeXML for call flows (greeting, dial agents, voicemail)
   - Tracks call status and agent availability
   - Handles retry logic and voicemail fallback

2. **AgentManagementService** (`src/services/callCenter/agentManagementService.ts`)
   - Registers and manages SIP connection agents
   - Tracks agent status (available, busy, offline)
   - Maintains agent metrics (calls answered, missed, average duration)
   - Handles agent heartbeats for online status

### API Endpoints

#### Call Handling Endpoints
- `GET /api/call-center/inbound` - Initial inbound call handler
- `GET /api/call-center/dial-agents` - Dial all available agents
- `GET /api/call-center/retry-dial` - Retry dialing after first attempt
- `GET /api/call-center/voicemail` - Voicemail recording flow
- `POST /api/call-center/voicemail/callback` - Voicemail completion handler
- `POST /api/call-center/outbound/event` - Agent SIP connection events
- `POST /api/call-center/events` - General call center events

#### Agent Management Endpoints
- `POST /api/call-center/agents/register` - Register new agent
- `POST /api/call-center/agents/heartbeat` - Agent heartbeat/status update
- `GET /api/call-center/agents/list` - List all agents (with optional status filter)
- `GET /api/call-center/agents/[agentId]` - Get agent details
- `PUT /api/call-center/agents/[agentId]` - Update agent
- `DELETE /api/call-center/agents/[agentId]` - Unregister agent

## Integration Points

### Compliance Integration
- All call events are logged via `auditEvidenceService`
- Call recordings are tracked and can be redacted
- Integrated with existing consent management flows
- Full audit trail for compliance requirements

### Environment Configuration
- Added Call Center configuration to `src/config/environment.ts`
- Environment variables in `docker.env.example`:
  - `CALL_CENTER_NUMBER`
  - `TELNYX_OUTBOUND_PROFILE_ID`
  - `CALL_CENTER_MAX_DIAL_ATTEMPTS`
  - `CALL_CENTER_DIAL_TIMEOUT`
  - `CALL_CENTER_VOICEMAIL_ENABLED`
  - `CALL_CENTER_RECORDING_ENABLED`

### Existing Services
- Uses existing `getEnvironmentConfig()` for webhook URLs
- Integrates with `auditEvidenceService` for compliance logging
- Follows existing TeXML patterns from `texmlTemplates.ts`
- Compatible with existing IVR service architecture

## Call Flow

1. **Inbound Call** → `GET /api/call-center/inbound`
   - Creates call record
   - Logs audit event
   - Returns greeting TeXML

2. **Dial Agents** → `GET /api/call-center/dial-agents`
   - Gets available agents from AgentManagementService
   - Generates TeXML with all agent SIP URIs
   - Simultaneously dials all agents

3. **Agent Answers** → `POST /api/call-center/outbound/event`
   - Updates call status to "answered"
   - Sets agent status to "busy"
   - Updates agent metrics
   - Logs audit event

4. **No Answer** → `GET /api/call-center/retry-dial`
   - Retries dialing (up to max attempts)
   - If max attempts reached → voicemail

5. **Voicemail** → `GET /api/call-center/voicemail`
   - Records voicemail message
   - Transcribes recording
   - Logs completion event

6. **Call Ends** → `POST /api/call-center/outbound/event`
   - Updates call status to "completed"
   - Sets agent back to "available"
   - Logs final audit event

## Key Features

### Multi-Agent Routing
- Simultaneously dials all available agents
- First agent to answer gets the call
- Other agents automatically stop ringing

### Retry Logic
- Configurable number of dial attempts
- Automatic retry if no agents answer
- Falls back to voicemail after max attempts

### Voicemail
- Optional voicemail recording
- Automatic transcription
- Callback URL for processing

### Call Recording
- Optional call recording
- Recording URLs tracked in call records
- Integrated with compliance redaction

### Agent Management
- Register/unregister agents
- Track agent status
- Agent metrics (calls, duration, etc.)
- Heartbeat system for online status

## Configuration

### Required Environment Variables
```bash
CALL_CENTER_NUMBER=+1234567890
TELNYX_OUTBOUND_PROFILE_ID=your_profile_id
WEBHOOK_BASE_URL=https://your-domain.com
TELNYX_API_KEY=your_api_key
```

### Optional Configuration
```bash
CALL_CENTER_MAX_DIAL_ATTEMPTS=2
CALL_CENTER_DIAL_TIMEOUT=30
CALL_CENTER_VOICEMAIL_ENABLED=true
CALL_CENTER_RECORDING_ENABLED=true
```

## Setup Requirements

1. **Telnyx Portal Configuration**:
   - Create TeXML Application
   - Configure webhook URLs
   - Purchase call center phone number
   - Create SIP Connections for agents
   - Create Outbound Voice Profile

2. **Agent Registration**:
   - Register agents via API
   - Agents send periodic heartbeats
   - Agents configure SIP clients with credentials

3. **Testing**:
   - Call call center number
   - Verify agents receive calls
   - Test voicemail flow
   - Verify audit logging

## Differences from Python Demo

The original Telnyx demo is Python-based using aiohttp. This implementation:

- **TypeScript/Node.js**: Adapted for existing codebase
- **Astro API Routes**: Uses Astro's API route system
- **Service Architecture**: Follows existing service patterns
- **Compliance Integration**: Full integration with compliance engine
- **Type Safety**: Full TypeScript types throughout

## File Structure

```
src/
├── services/
│   └── callCenter/
│       ├── callCenterService.ts      # Core call center logic
│       ├── agentManagementService.ts  # Agent management
│       └── index.ts                   # Exports
├── pages/
│   └── api/
│       └── call-center/
│           ├── inbound.ts             # Inbound call handler
│           ├── dial-agents.ts        # Dial agents handler
│           ├── retry-dial.ts         # Retry dial handler
│           ├── voicemail.ts          # Voicemail handler
│           ├── voicemail/
│           │   └── callback.ts       # Voicemail callback
│           ├── outbound/
│           │   └── event.ts          # Agent events
│           ├── events.ts             # General events
│           └── agents/
│               ├── register.ts        # Agent registration
│               ├── heartbeat.ts      # Agent heartbeat
│               ├── list.ts           # List agents
│               └── [agentId].ts      # Agent CRUD
└── config/
    └── environment.ts                # Updated with call center config

docs/
├── call-center-setup.md              # Setup guide
└── call-center-implementation.md    # This file
```

## Next Steps

1. **Testing**: Create unit and integration tests
2. **Dashboard**: Build admin dashboard for monitoring
3. **CRM Integration**: Connect with CRM systems
4. **Analytics**: Add call analytics and reporting
5. **Customization**: Allow per-tenant call center configurations
6. **Advanced Features**: Queue management, skill-based routing, etc.

## References

- [Telnyx Call Center Tutorial](https://developers.telnyx.com/docs/voice/programmable-voice/call-center)
- [Telnyx TeXML Documentation](https://developers.telnyx.com/docs/voice/texml)
- [Setup Guide](./call-center-setup.md)
