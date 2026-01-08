# Call Center Setup Guide

This guide explains how to set up and configure the Telnyx-powered Call Center system integrated into the TETRIX platform.

## Overview

The Call Center service enables:
- **Multi-agent call routing**: Simultaneously dial multiple agents (SIP connections)
- **Call recording**: Automatic recording of answered calls
- **Voicemail**: Capture voicemail when no agents are available
- **Agent management**: Register, track, and manage agent availability
- **Compliance integration**: Full audit logging and compliance tracking

## Architecture

The Call Center is built on:
- **TeXML**: For call flow control and routing
- **SIP Connections**: Agents connect via SIP credentials
- **Telnyx Voice API**: For call handling and routing
- **Compliance Services**: Integrated with existing audit and compliance infrastructure

## Prerequisites

1. **Telnyx Account**: Active Telnyx account with API access
2. **Telnyx Phone Number**: A voice-enabled number for the call center
3. **SIP Connections**: One or more SIP connections for agents
4. **Outbound Voice Profile**: Configured with SIP connections

## Setup Steps

### 1. Configure Environment Variables

Add the following to your `.env` or `docker.env`:

```bash
# Call Center Configuration
CALL_CENTER_NUMBER=+1234567890  # Your call center phone number
TELNYX_OUTBOUND_PROFILE_ID=your_outbound_profile_id
CALL_CENTER_MAX_DIAL_ATTEMPTS=2
CALL_CENTER_DIAL_TIMEOUT=30
CALL_CENTER_VOICEMAIL_ENABLED=true
CALL_CENTER_RECORDING_ENABLED=true

# Telnyx Configuration (if not already set)
TELNYX_API_KEY=your_telnyx_api_key
WEBHOOK_BASE_URL=https://your-domain.com  # Or use ngrok for local dev
```

### 2. Create TeXML Application in Telnyx Portal

1. Log into [Telnyx Mission Control Portal](https://portal.telnyx.com)
2. Navigate to **Call Control** > **TeXML Applications**
3. Click **Add a new TeXML Application**
4. Configure:
   - **Voice Method**: `GET`
   - **Voice URL**: `https://your-domain.com/api/call-center/inbound`
   - **Status Callback Method**: `POST`
   - **Status Callback URL**: `https://your-domain.com/api/call-center/events`

### 3. Configure Phone Number

1. In Telnyx Portal, go to **Numbers** > **Search & Buy Numbers**
2. Purchase a voice-enabled number
3. At checkout, associate it with your TeXML Application

### 4. Create SIP Connections for Agents

For each agent:

1. Go to **SIP Connections** > **Add Connection**
2. Select **Credentials** as connection type
3. Configure:
   - **Username**: Unique identifier (e.g., `agent1`)
   - **Webhook URL** (under Events): `https://your-domain.com/api/call-center/outbound/event`
   - **Receive SIP URI Calls**: Set to **From anyone**
4. Save and note the **Connection ID** and **SIP URI**

### 5. Create Outbound Voice Profile

1. Go to **Outbound Voice Profiles**
2. Create a new profile
3. Add all agent SIP Connections to the profile
4. Note the **Profile ID** (use for `TELNYX_OUTBOUND_PROFILE_ID`)

### 6. Register Agents

Register agents via API or programmatically:

```bash
POST /api/call-center/agents/register
Content-Type: application/json

{
  "agentId": "agent_001",
  "sipConnectionId": "connection_id_from_telnyx",
  "sipUri": "sip:agent1@telnyx.com",
  "username": "agent1",
  "displayName": "John Doe"
}
```

### 7. Agent Heartbeat (Optional)

Agents should send periodic heartbeats to indicate they're online:

```bash
POST /api/call-center/agents/heartbeat
Content-Type: application/json

{
  "agentId": "agent_001",
  "status": "available"  # or "busy", "offline"
}
```

## Call Flow

1. **Call Initiated**: Customer calls call center number
   - Webhook: `GET /api/call-center/inbound`
   - Response: Greeting TeXML

2. **Dial Agents**: System dials all available agents simultaneously
   - Webhook: `GET /api/call-center/dial-agents?callId=xxx`
   - Response: Dial TeXML with all agent SIP URIs

3. **Agent Answers**: First agent to answer gets the call
   - Event: `POST /api/call-center/outbound/event`
   - Other agents stop ringing automatically

4. **No Answer**: If no agents answer, retry or go to voicemail
   - Retry: `GET /api/call-center/retry-dial?callId=xxx&attempt=2`
   - Voicemail: `GET /api/call-center/voicemail?callId=xxx`

5. **Call Ends**: Thank you message and cleanup
   - Event: `POST /api/call-center/outbound/event` (call.hangup)

## API Endpoints

### Call Handling
- `GET /api/call-center/inbound` - Handle inbound calls
- `GET /api/call-center/dial-agents` - Dial all available agents
- `GET /api/call-center/retry-dial` - Retry dialing agents
- `GET /api/call-center/voicemail` - Voicemail recording
- `POST /api/call-center/voicemail/callback` - Voicemail completion
- `POST /api/call-center/outbound/event` - Agent call events
- `POST /api/call-center/events` - General call events

### Agent Management
- `POST /api/call-center/agents/register` - Register new agent
- `POST /api/call-center/agents/heartbeat` - Agent heartbeat
- `GET /api/call-center/agents/list` - List all agents
- `GET /api/call-center/agents/[agentId]` - Get agent details
- `PUT /api/call-center/agents/[agentId]` - Update agent
- `DELETE /api/call-center/agents/[agentId]` - Unregister agent

## Integration with Compliance

The Call Center is fully integrated with the compliance engine:

- **Audit Logging**: All call events are logged via `auditEvidenceService`
- **Call Recording**: Recordings are tracked and can be redacted for compliance
- **Consent Management**: Integrated with consent capture flows
- **Data Redaction**: PII/PHI can be redacted from recordings and transcripts

## Local Development with ngrok

For local development:

1. Install ngrok: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com)
2. Start ngrok: `ngrok http 4321` (or your Astro port)
3. Use the HTTPS forwarding URL in:
   - TeXML Application webhook URLs
   - SIP Connection webhook URLs
   - `WEBHOOK_BASE_URL` environment variable

## Testing

Test the call center by:

1. Calling your call center number
2. Verifying agents receive the call
3. Checking agent status via `/api/call-center/agents/list`
4. Reviewing audit logs for compliance

## Troubleshooting

### Agents Not Receiving Calls
- Verify SIP connections are registered and online
- Check Outbound Voice Profile includes all connections
- Verify SIP URI format: `sip:username@telnyx.com`
- Check agent heartbeat status

### Calls Not Routing
- Verify TeXML Application webhook URLs are correct
- Check `WEBHOOK_BASE_URL` environment variable
- Review server logs for errors
- Verify phone number is associated with TeXML Application

### Voicemail Not Working
- Ensure `CALL_CENTER_VOICEMAIL_ENABLED=true`
- Check voicemail callback URL is accessible
- Verify recording permissions in Telnyx

## Next Steps

- Customize greeting messages in `callCenterService.ts`
- Add custom call routing logic
- Integrate with CRM systems
- Add real-time dashboard for call monitoring
- Configure industry-specific compliance rules

## References

- [Telnyx Call Center Tutorial](https://developers.telnyx.com/docs/voice/programmable-voice/call-center)
- [Telnyx TeXML Documentation](https://developers.telnyx.com/docs/voice/texml)
- [Telnyx SIP Connections Guide](https://developers.telnyx.com/docs/voice/sip-connections)
