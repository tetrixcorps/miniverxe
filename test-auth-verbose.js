// Test script to capture verbose authentication logging
const puppeteer = require('puppeteer');

async function testAuthVerbose() {
    console.log('🚀 Starting comprehensive authentication verbose test...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Capture all console output
    const consoleLogs = [];
    page.on('console', msg => {
        const logEntry = {
            type: msg.type(),
            text: msg.text(),
            timestamp: new Date().toISOString()
        };
        consoleLogs.push(logEntry);
        console.log(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Capture network requests
    page.on('request', request => {
        console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
        console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
    });
    
    try {
        // Navigate to the main page
        console.log('📄 Navigating to localhost:8080...');
        await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
        
        // Wait for page to be fully loaded
        await page.waitForTimeout(2000);
        console.log('✅ Page loaded successfully');
        
        // Check if Client Login button exists
        const clientLoginBtn = await page.$('#client-login-2fa-btn');
        if (clientLoginBtn) {
            console.log('✅ Client Login button found');
            
            // Click the button
            console.log('🖱️ Clicking Client Login button...');
            await clientLoginBtn.click();
            
            // Wait for modal to appear
            await page.waitForTimeout(3000);
            
            // Check if modal opened
            const modal = await page.$('#industry-auth-modal');
            if (modal) {
                console.log('✅ Industry Auth modal found');
                
                // Check if modal is visible
                const isVisible = await page.evaluate(() => {
                    const modal = document.getElementById('industry-auth-modal');
                    return modal && !modal.classList.contains('hidden');
                });
                
                if (isVisible) {
                    console.log('✅ Industry Auth modal is visible');
                } else {
                    console.log('❌ Industry Auth modal is not visible');
                }
            } else {
                console.log('❌ Industry Auth modal not found');
            }
        } else {
            console.log('❌ Client Login button not found');
        }
        
        // Analyze console logs
        console.log('\n📊 Console Log Analysis:');
        const verboseLogs = consoleLogs.filter(log => log.text.includes('[VERBOSE]'));
        const errorLogs = consoleLogs.filter(log => log.type === 'error');
        const warningLogs = consoleLogs.filter(log => log.type === 'warn');
        
        console.log(`Total logs: ${consoleLogs.length}`);
        console.log(`Verbose logs: ${verboseLogs.length}`);
        console.log(`Error logs: ${errorLogs.length}`);
        console.log(`Warning logs: ${warningLogs.length}`);
        
        if (verboseLogs.length > 0) {
            console.log('\n🔍 Verbose Logs:');
            verboseLogs.forEach(log => {
                console.log(`  [${log.timestamp}] ${log.text}`);
            });
        }
        
        if (errorLogs.length > 0) {
            console.log('\n❌ Error Logs:');
            errorLogs.forEach(log => {
                console.log(`  [${log.timestamp}] ${log.text}`);
            });
        }
        
        // Export logs
        const exportData = {
            consoleLogs,
            verboseLogs,
            errorLogs,
            warningLogs,
            summary: {
                total: consoleLogs.length,
                verbose: verboseLogs.length,
                errors: errorLogs.length,
                warnings: warningLogs.length
            },
            timestamp: new Date().toISOString()
        };
        
        const fs = require('fs');
        fs.writeFileSync(`auth-test-results-${Date.now()}.json`, JSON.stringify(exportData, null, 2));
        console.log('📁 Test results exported to JSON file');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testAuthVerbose().catch(console.error);
