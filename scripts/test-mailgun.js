#!/usr/bin/env node

/**
 * Test script for Mailgun integration
 * Run with: node scripts/test-mailgun.js
 */

import https from 'https';
import querystring from 'querystring';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnvFile();

// Configuration
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'mg.tetrixcorp.com';
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const CONTACT_EMAIL = 'support@tetrixcorp.com';
const FROM_EMAIL = 'noreply@tetrixcorp.com';

if (!MAILGUN_API_KEY) {
  console.error('❌ MAILGUN_API_KEY environment variable is not set');
  console.error('Please set it in your .env file or environment variables');
  process.exit(1);
}

// Test email data
const testEmailData = {
  from: `Test User <${FROM_EMAIL}>`,
  to: CONTACT_EMAIL,
  'h:Reply-To': 'test@example.com',
  subject: 'Test Contact Form Submission',
  text: `
Name: Test User
Email: test@example.com
Company: Test Company
Subject: Test Contact Form Submission

Message:
This is a test message from the TETRIX contact form integration.

---
This message was sent from the TETRIX contact form test script.
  `.trim(),
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Test Contact Form Submission</h2>
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Name:</strong> Test User</p>
        <p><strong>Email:</strong> test@example.com</p>
        <p><strong>Company:</strong> Test Company</p>
        <p><strong>Subject:</strong> Test Contact Form Submission</p>
      </div>
      <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3 style="color: #374151; margin-top: 0;">Message:</h3>
        <p style="white-space: pre-wrap; line-height: 1.6;">This is a test message from the TETRIX contact form integration.</p>
      </div>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">
        This message was sent from the TETRIX contact form test script.
      </p>
    </div>
  `.trim()
};

// Create the request
const postData = querystring.stringify(testEmailData);
const auth = Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64');

const options = {
  hostname: 'api.mailgun.net',
  port: 443,
  path: `/v3/${MAILGUN_DOMAIN}/messages`,
  method: 'POST',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚀 Testing Mailgun integration...');
console.log(`📧 Sending test email to: ${CONTACT_EMAIL}`);
console.log(`📤 From: ${FROM_EMAIL}`);
console.log(`🌐 Domain: ${MAILGUN_DOMAIN}`);

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Test email sent successfully!');
      console.log('📨 Check your email at:', CONTACT_EMAIL);
      
      try {
        const response = JSON.parse(data);
        console.log('📋 Response:', response);
      } catch (e) {
        console.log('📋 Raw response:', data);
      }
    } else {
      console.error('❌ Failed to send test email');
      console.error('Status Code:', res.statusCode);
      console.error('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(postData);
req.end();
