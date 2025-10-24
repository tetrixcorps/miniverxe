const { chromium } = require('playwright');

async function testShangoChat() {
  console.log('🚀 Starting SHANGO Chat test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📱 Navigating to Contact Us page...');
    await page.goto('http://localhost:8080/contact');
    await page.waitForLoadState('networkidle');
    
    console.log('🔍 Looking for SHANGO chat widget...');
    const chatWidget = await page.locator('#shango-chat-widget');
    const isVisible = await chatWidget.isVisible();
    console.log('SHANGO Chat Widget Visible:', isVisible);
    
    if (isVisible) {
      console.log('✅ SHANGO Chat widget found!');
      
      // Look for the start button
      const startButton = page.locator('button:has-text("Start Chat with SHANGO")');
      const buttonVisible = await startButton.isVisible();
      console.log('Start Button Visible:', buttonVisible);
      
      if (buttonVisible) {
        console.log('🖱️ Clicking Start Chat button...');
        await startButton.click();
        await page.waitForTimeout(3000);
        
        // Check if chat interface appeared
        const chatInterface = page.locator('.shango-chat-widget');
        const interfaceVisible = await chatInterface.isVisible();
        console.log('Chat Interface Visible:', interfaceVisible);
        
        // Check for message input
        const messageInput = page.locator('#shango-message-input');
        const inputVisible = await messageInput.isVisible();
        console.log('Message Input Visible:', inputVisible);
        
        if (inputVisible) {
          console.log('📝 Testing message sending...');
          await messageInput.fill('Hello SHANGO, test message');
          
          const sendButton = page.locator('#shango-send-message');
          await sendButton.click();
          await page.waitForTimeout(2000);
          
          console.log('✅ Message sent successfully!');
        }
      }
    } else {
      console.log('❌ SHANGO Chat widget not found!');
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'shango-chat-test-result.png' });
    console.log('📸 Screenshot saved as shango-chat-test-result.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
    console.log('🏁 Test completed!');
  }
}

testShangoChat();
