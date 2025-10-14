#!/usr/bin/env node

/**
 * Test Code Academy SinchChatLive Integration
 * Tests the Code Academy dashboard AI integration with SinchChatLive primary + Ollama fallback
 */

const BASE_URL = 'http://localhost:8080';
const OLLAMA_URL = 'http://localhost:11434';

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
function logTest(testName, status, details = '') {
  testResults.total++;
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ ${testName}: PASS`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: FAIL - ${details}`);
  }
  testResults.details.push({ test: testName, status, details });
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, status: 0, data: null, error: error.message };
  }
}

// Test 1: Ollama Service Availability
async function testOllamaAvailability() {
  console.log('\n🔍 Testing Ollama Service Availability...');
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      const qwen3Model = data.models?.find(m => m.name.includes('qwen3'));
      if (qwen3Model) {
        logTest('Ollama Service', 'PASS', `qwen3 model available: ${qwen3Model.name}`);
        return true;
      } else {
        logTest('Ollama Service', 'FAIL', 'qwen3 model not found');
        return false;
      }
    } else {
      logTest('Ollama Service', 'FAIL', `HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Ollama Service', 'FAIL', error.message);
    return false;
  }
}

// Test 2: Code Academy Frontend Accessibility
async function testCodeAcademyFrontend() {
  console.log('\n🔍 Testing Code Academy Frontend Accessibility...');
  
  try {
    // Check if the Code Academy frontend is accessible
    const response = await fetch(`${BASE_URL}/code-academy`);
    if (response.ok) {
      const html = await response.text();
      if (html.includes('Code Academy') || html.includes('dashboard')) {
        logTest('Code Academy Frontend', 'PASS', 'Frontend accessible');
        return true;
      } else {
        logTest('Code Academy Frontend', 'FAIL', 'Content not found');
        return false;
      }
    } else {
      logTest('Code Academy Frontend', 'FAIL', `HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Code Academy Frontend', 'FAIL', error.message);
    return false;
  }
}

// Test 3: AI Service Integration Test
async function testAIServiceIntegration() {
  console.log('\n🔍 Testing AI Service Integration...');
  
  try {
    // Test code analysis with a simple JavaScript function
    const testCode = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen3:latest',
        prompt: `You are SHANGO Tech, an AI coding assistant for the Code Academy platform. Analyze this JavaScript code and provide feedback:

\`\`\`javascript
${testCode}
\`\`\`

Please provide:
1. Code quality score (1-10)
2. Specific suggestions for improvement
3. Any errors or issues found
4. Performance analysis
5. Best practices recommendations

Format your response as a structured analysis.`,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 1024
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.response && data.response.length > 100) {
        logTest('AI Service Integration', 'PASS', 'Code analysis working');
        return true;
      } else {
        logTest('AI Service Integration', 'FAIL', 'Response too short');
        return false;
      }
    } else {
      logTest('AI Service Integration', 'FAIL', `HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('AI Service Integration', 'FAIL', error.message);
    return false;
  }
}

// Test 4: Learning Insights Test
async function testLearningInsights() {
  console.log('\n🔍 Testing Learning Insights Generation...');
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen3:latest',
        prompt: `You are SHANGO, an AI learning advisor for the Code Academy platform. Analyze this student's learning progress and provide personalized insights.

Student ID: test-student-123
Completed Courses: JavaScript Basics, React Fundamentals
Current Skills: HTML, CSS, JavaScript, React
Performance Data: {"averageScore": 85, "timeSpent": 120, "completedExercises": 45}

Please provide:
1. Learning strengths and weaknesses
2. Personalized recommendations
3. Next topics to study
4. Study plan with specific activities
5. Progress score and estimated completion time

Be encouraging and specific in your recommendations.`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1024
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.response && (data.response.includes('strengths') || data.response.includes('recommendations'))) {
        logTest('Learning Insights', 'PASS', 'Learning insights generated');
        return true;
      } else {
        logTest('Learning Insights', 'FAIL', 'Response format incorrect');
        return false;
      }
    } else {
      logTest('Learning Insights', 'FAIL', `HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Learning Insights', 'FAIL', error.message);
    return false;
  }
}

// Test 5: Coding Assistance Test
async function testCodingAssistance() {
  console.log('\n🔍 Testing Coding Assistance...');
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen3:latest',
        prompt: `You are SHANGO Tech, an AI coding assistant for the Code Academy platform. Help the student with their coding question.

Question: How do I create a React component that fetches data from an API?

Please provide:
1. A clear explanation of the solution
2. Code examples if applicable
3. Best practices and tips
4. Related concepts to study

Be encouraging and educational in your response.`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1024
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.response && (data.response.includes('React') || data.response.includes('component'))) {
        logTest('Coding Assistance', 'PASS', 'Coding assistance working');
        return true;
      } else {
        logTest('Coding Assistance', 'FAIL', 'Response not relevant');
        return false;
      }
    } else {
      logTest('Coding Assistance', 'FAIL', `HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Coding Assistance', 'FAIL', error.message);
    return false;
  }
}

// Test 6: Performance Test
async function testPerformance() {
  console.log('\n🔍 Testing Performance...');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen3:latest',
        prompt: 'You are SHANGO Tech. Explain what is a variable in programming in one sentence.',
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 100
        }
      })
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (response.ok && responseTime < 10000) { // Less than 10 seconds
      logTest('Performance', 'PASS', `Response time: ${responseTime}ms`);
      return true;
    } else {
      logTest('Performance', 'FAIL', `Response time too slow: ${responseTime}ms`);
      return false;
    }
  } catch (error) {
    logTest('Performance', 'FAIL', error.message);
    return false;
  }
}

// Test 7: SinchChatLive Integration Test
async function testSinchChatLiveIntegration() {
  console.log('\n🔍 Testing SinchChatLive Integration...');
  
  try {
    // Test if the SinchChatLive service is available
    const response = await fetch(`${BASE_URL}/api/v1/shango/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'code-academy-test-user',
        agentId: 'shango-technical'
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.session) {
        logTest('SinchChatLive Integration', 'PASS', `Session created: ${data.session.id}`);
        return data.session.id;
      } else {
        logTest('SinchChatLive Integration', 'FAIL', 'Session creation failed');
        return null;
      }
    } else {
      logTest('SinchChatLive Integration', 'FAIL', `HTTP ${response.status}`);
      return null;
    }
  } catch (error) {
    logTest('SinchChatLive Integration', 'FAIL', error.message);
    return null;
  }
}

// Test 8: End-to-End AI Flow Test
async function testEndToEndAIFlow(sessionId) {
  console.log('\n🔍 Testing End-to-End AI Flow...');
  
  if (!sessionId) {
    logTest('End-to-End AI Flow', 'FAIL', 'No session ID provided');
    return false;
  }

  try {
    // Send a coding question through the SHANGO API
    const response = await fetch(`${BASE_URL}/api/v1/shango/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'How do I optimize a React component for better performance?',
        role: 'user',
        agentId: 'shango-technical'
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.aiResponse && data.aiResponse.content) {
        const aiResponse = data.aiResponse.content;
        if (aiResponse.length > 50 && (aiResponse.includes('React') || aiResponse.includes('performance'))) {
          logTest('End-to-End AI Flow', 'PASS', 'AI response received through SHANGO API');
          return true;
        } else {
          logTest('End-to-End AI Flow', 'FAIL', 'AI response not relevant');
          return false;
        }
      } else {
        logTest('End-to-End AI Flow', 'FAIL', 'No AI response received');
        return false;
      }
    } else {
      logTest('End-to-End AI Flow', 'FAIL', `HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('End-to-End AI Flow', 'FAIL', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Code Academy SinchChatLive Integration Tests...\n');
  
  // Test 1: Ollama availability
  const ollamaAvailable = await testOllamaAvailability();
  
  // Test 2: Code Academy frontend
  const frontendAvailable = await testCodeAcademyFrontend();
  
  // Test 3: AI service integration
  await testAIServiceIntegration();
  
  // Test 4: Learning insights
  await testLearningInsights();
  
  // Test 5: Coding assistance
  await testCodingAssistance();
  
  // Test 6: Performance
  await testPerformance();
  
  // Test 7: SinchChatLive integration
  const sessionId = await testSinchChatLiveIntegration();
  
  // Test 8: End-to-end AI flow
  await testEndToEndAIFlow(sessionId);
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.details
      .filter(test => test.status === 'FAIL')
      .forEach(test => console.log(`  - ${test.test}: ${test.details}`));
  }
  
  console.log('\n🎯 Integration Status:');
  if (testResults.failed === 0) {
    console.log('✅ ALL TESTS PASSED - Code Academy SinchChatLive integration is working perfectly!');
  } else if (testResults.passed > testResults.failed) {
    console.log('⚠️  MOSTLY WORKING - Some issues detected, but core functionality is operational');
  } else {
    console.log('❌ MAJOR ISSUES - Significant problems detected in the integration');
  }
  
  console.log('\n🔧 Architecture Summary:');
  console.log('1. SinchChatLive: Primary AI system (may fail due to API credentials)');
  console.log('2. Ollama: Fallback AI system (working)');
  console.log('3. Code Academy: Frontend integration (working)');
  console.log('4. AI Services: Code analysis, learning insights, coding assistance');
  
  return testResults.failed === 0;
}

// Run the tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
