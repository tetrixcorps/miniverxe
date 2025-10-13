// Test script for SHANGO API endpoints
const baseUrl = 'http://localhost:8080';

async function testSHANGOAPI() {
  console.log('🧪 Testing SHANGO API endpoints...\n');

  try {
    // Test 1: Get available agents
    console.log('1. Testing GET /api/v1/shango/sessions (agents)');
    const agentsResponse = await fetch(`${baseUrl}/api/v1/shango/sessions`);
    const agentsData = await agentsResponse.json();
    
    if (agentsData.success) {
      console.log('✅ Agents retrieved successfully');
      console.log(`   Found ${agentsData.agents.length} agents:`, agentsData.agents.map(a => a.name).join(', '));
    } else {
      console.log('❌ Failed to get agents:', agentsData.error);
    }

    // Test 2: Create a new session
    console.log('\n2. Testing POST /api/v1/shango/sessions (create session)');
    const sessionResponse = await fetch(`${baseUrl}/api/v1/shango/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-123',
        agentId: 'shango-general',
        channel: 'chat'
      })
    });
    
    const sessionData = await sessionResponse.json();
    
    if (sessionData.success) {
      console.log('✅ Session created successfully');
      console.log(`   Session ID: ${sessionData.session.id}`);
      console.log(`   Agent: ${sessionData.session.agentId}`);
      
      const sessionId = sessionData.session.id;
      
      // Test 3: Send a message
      console.log('\n3. Testing POST /api/v1/shango/sessions/{id}/messages (send message)');
      const messageResponse = await fetch(`${baseUrl}/api/v1/shango/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello SHANGO! Can you help me with pricing?',
          role: 'user',
          agentId: 'shango-general'
        })
      });
      
      const messageData = await messageResponse.json();
      
      if (messageData.success) {
        console.log('✅ Message sent successfully');
        console.log(`   User message: ${messageData.message.content}`);
        console.log(`   AI response: ${messageData.aiResponse.content}`);
      } else {
        console.log('❌ Failed to send message:', messageData.error);
      }
      
      // Test 4: Get chat history
      console.log('\n4. Testing GET /api/v1/shango/sessions/{id}/messages (get history)');
      const historyResponse = await fetch(`${baseUrl}/api/v1/shango/sessions/${sessionId}/messages`);
      const historyData = await historyResponse.json();
      
      if (historyData.success) {
        console.log('✅ Chat history retrieved successfully');
        console.log(`   Found ${historyData.messages.length} messages`);
      } else {
        console.log('❌ Failed to get chat history:', historyData.error);
      }
      
    } else {
      console.log('❌ Failed to create session:', sessionData.error);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testSHANGOAPI();
