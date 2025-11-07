# JoRoMi AI Chat SSE Streaming Fix

## Issue Analysis

The JoRoMi chat has an SSE (Server-Sent Events) streaming endpoint implemented at `/api/v1/joromi/sessions/[sessionId]/stream`, but the frontend is not properly parsing the SSE format, causing streaming to fail.

---

## Root Cause

### Problem 1: SSE Format Parsing
The frontend code in `contact.astro` is parsing SSE events incorrectly:
- SSE format requires events to be separated by `\n\n` (double newline)
- The frontend is splitting by single `\n` which can cause incomplete event parsing
- The buffer handling doesn't properly account for multi-line data fields

### Problem 2: Event Structure Mismatch
- Frontend expects: `data.content` for chunks
- Backend sends: `data: { content: "word " }` which is correct
- But the parsing logic may miss events if the buffer is split incorrectly

### Problem 3: Missing Error Handling
- No logging when SSE connection fails
- No fallback when stream is interrupted
- No validation of SSE event format

---

## Current Implementation

### Backend (`src/pages/api/v1/joromi/sessions/[sessionId]/stream.ts`)
✅ **Correctly implemented:**
- Uses `ReadableStream` with proper SSE format
- Sends events with `event:` and `data:` lines
- Properly closes stream with `controller.close()`
- Headers are correct: `text/event-stream`, `no-cache`, `keep-alive`

### Frontend (`src/pages/contact.astro`)
❌ **Issues:**
- SSE parsing splits by single `\n` instead of handling `\n\n` delimiters
- Buffer handling may miss complete events
- No validation of event format
- Missing error handling for stream interruptions

---

## Solution

### Fix 1: Improve SSE Parsing Logic

The frontend needs to properly parse SSE format:
1. Accumulate data until `\n\n` is found (complete event)
2. Parse each complete event
3. Handle multi-line data fields correctly

### Fix 2: Add Better Error Handling

1. Log SSE connection status
2. Handle stream errors gracefully
3. Provide user feedback during streaming
4. Fallback to non-streaming endpoint on failure

### Fix 3: Validate Event Format

1. Check for `event:` line before `data:` line
2. Validate JSON in `data:` field
3. Handle malformed events gracefully

---

## Implementation

### Updated Frontend Code

The frontend should properly parse SSE events:

```javascript
// Proper SSE parsing
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  
  // SSE events are separated by \n\n
  const events = buffer.split('\n\n');
  // Keep the last incomplete event in buffer
  buffer = events.pop() || '';

  for (const event of events) {
    if (!event.trim()) continue;
    
    let eventType = 'message'; // default SSE event type
    let eventData = null;
    
    const lines = event.split('\n');
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.substring(7).trim();
      } else if (line.startsWith('data: ')) {
        try {
          eventData = JSON.parse(line.substring(6));
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
          continue;
        }
      }
    }
    
    if (eventData) {
      // Handle different event types
      if (eventType === 'chunk' && eventData.content) {
        aiMessage.content += eventData.content;
        updateMessagesDisplay();
      } else if (eventType === 'complete' && eventData.message) {
        aiMessage.id = eventData.message.id;
        aiMessage.content = eventData.message.content;
        aiMessage.isStreaming = false;
        updateMessagesDisplay();
      }
    }
  }
}
```

---

## Testing

### Test SSE Streaming

1. **Start a chat session**
2. **Send a message**
3. **Verify streaming works:**
   - Words should appear one by one
   - No errors in console
   - Complete message appears at end

### Test Error Handling

1. **Interrupt the stream** (close tab, network error)
2. **Verify fallback works:**
   - Falls back to non-streaming endpoint
   - User sees complete message
   - No errors shown to user

---

## Expected Behavior

### Successful Streaming
1. User sends message
2. Streaming placeholder appears
3. Words stream in one by one (50ms delay)
4. Complete message appears
5. Streaming indicator disappears

### Failed Streaming
1. User sends message
2. Streaming placeholder appears
3. Stream fails (network error, timeout)
4. Automatically falls back to non-streaming endpoint
5. Complete message appears
6. User sees no error (seamless fallback)

---

## Next Steps

1. ✅ Fix SSE parsing logic in `contact.astro`
2. ✅ Add proper error handling
3. ✅ Test streaming functionality
4. ✅ Verify fallback works
5. ✅ Add logging for debugging

---

## Related Files

- **Backend**: `src/pages/api/v1/joromi/sessions/[sessionId]/stream.ts`
- **Frontend**: `src/pages/contact.astro` (lines 558-622)
- **Storage**: `src/pages/api/v1/joromi/storage.ts`

---

**Status**: Ready for implementation ✅

