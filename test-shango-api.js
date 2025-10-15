// Test SHANGO API endpoints
const testSHANGOAPI = async () => {
  console.log('Testing SHANGO API endpoints...');
  
  try {
    // Test 1: Create a session
    console.log('1. Testing session creation...');
    const sessionResponse = await fetch('/api/v1/shango/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-' + Date.now(),
        agentId: 'shango-general',
        channel: 'chat'
      })
    });
    
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      console.log('✅ Session created successfully:', sessionData);
      
      // Test 2: Send a message
      console.log('2. Testing message sending...');
      const messageResponse = await fetch(`/api/v1/shango/sessions/${sessionData.session.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello SHANGO!',
          role: 'user',
          agentId: 'shango-general'
        })
      });
      
      if (messageResponse.ok) {
        const messageData = await messageResponse.json();
        console.log('✅ Message sent successfully:', messageData);
        console.log('🎉 All tests passed! SHANGO API is working correctly.');
      } else {
        console.error('❌ Message sending failed:', await messageResponse.text());
      }
    } else {
      console.error('❌ Session creation failed:', await sessionResponse.text());
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
};

// Run the test
testSHANGOAPI();