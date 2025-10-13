# Mailgun Setup for TETRIX Contact Form

## Overview
The contact form has been updated to use Mailgun for sending email notifications to `support@tetrixcorp.com` when users submit the contact form.

## What's Been Implemented

### 1. Mailgun Integration
- ✅ Created `/api/contact/notify` endpoint with proper Mailgun integration
- ✅ Added beautiful HTML email template with TETRIX branding
- ✅ Updated contact form to include subject field
- ✅ Fixed character encoding issues in contact page
- ✅ Added Mailgun configuration to environment variables

### 2. Contact Form Updates
- ✅ Added required subject field to contact form
- ✅ Fixed malformed SHANGO emoji (&#129302;)
- ✅ Updated form validation to include subject
- ✅ Enhanced form submission flow

### 3. Email Template Features
- ✅ Professional TETRIX-branded email design
- ✅ Gradient header with TETRIX colors
- ✅ Structured contact details section
- ✅ Formatted message display
- ✅ Submission ID and timestamp tracking
- ✅ Admin panel link for easy management

## Required Configuration

### 1. Mailgun Account Setup
1. Sign up for a Mailgun account at https://www.mailgun.com/
2. Verify your domain `mg.tetrixcorp.com` (or use sandbox domain for testing)
3. Get your API key from the Mailgun dashboard

### 2. DigitalOcean App Configuration
Update your DigitalOcean app environment variables:

```bash
# Set the Mailgun API key
doctl apps update ca96485c-ee6b-401b-b1a2-8442c3bc7f04 --spec .do/app-final.yaml

# Or manually set the environment variables:
doctl apps update ca96485c-ee6b-401b-b1a2-8442c3bc7f04 --env MAILGUN_API_KEY="your-actual-mailgun-api-key"
doctl apps update ca96485c-ee6b-401b-b1a2-8442c3bc7f04 --env MAILGUN_DOMAIN="mg.tetrixcorp.com"
doctl apps update ca96485c-ee6b-401b-b1a2-8442c3bc7f04 --env ADMIN_EMAIL="support@tetrixcorp.com"
```

### 3. Domain Verification
1. In Mailgun dashboard, add and verify `mg.tetrixcorp.com` domain
2. Update DNS records as instructed by Mailgun
3. Wait for domain verification to complete

## Testing

### 1. Test Script
Run the included test script to verify Mailgun configuration:

```bash
# Set environment variables first
export MAILGUN_API_KEY="your-mailgun-api-key"
export MAILGUN_DOMAIN="mg.tetrixcorp.com"

# Run test
node test-mailgun-contact.js
```

### 2. Contact Form Testing
1. Visit https://tetrixcorp.com/contact
2. Fill out the contact form with test data
3. Submit the form
4. Check `support@tetrixcorp.com` for the email notification

## Email Flow

1. **User submits contact form** → Form data sent to `/api/contact`
2. **Data stored in Firebase** → Contact submission saved to database
3. **Email notification triggered** → `/api/contact/notify` called with form data
4. **Mailgun sends email** → Professional email sent to `support@tetrixcorp.com`
5. **User receives confirmation** → Success message shown on contact page

## Troubleshooting

### Common Issues

1. **"Email service not configured" error**
   - Check that `MAILGUN_API_KEY` is set in environment variables
   - Verify the API key is correct

2. **"Forbidden" error from Mailgun**
   - Check that the domain is verified in Mailgun dashboard
   - Ensure the API key has proper permissions

3. **"Unauthorized" error from Mailgun**
   - Verify the API key is correct
   - Check that the API key is active

4. **Emails not being received**
   - Check spam folder
   - Verify the recipient email address is correct
   - Check Mailgun logs for delivery status

### Debug Steps

1. Check app logs:
   ```bash
   doctl apps logs ca96485c-ee6b-401b-b1a2-8442c3bc7f04 --follow
   ```

2. Test Mailgun API directly:
   ```bash
   node test-mailgun-contact.js
   ```

3. Check environment variables:
   ```bash
   doctl apps get ca96485c-ee6b-401b-b1a2-8442c3bc7f04 --format "Spec.Env"
   ```

## Files Modified

- `src/pages/api/contact/notify.js` - New Mailgun email endpoint
- `src/pages/api/contact.js` - Updated to use new email endpoint
- `src/pages/contact.astro` - Added subject field, fixed emoji
- `src/lib/env.js` - Added Mailgun configuration
- `.do/app-final.yaml` - Added Mailgun environment variables
- `test-mailgun-contact.js` - Test script for Mailgun functionality

## Next Steps

1. **Configure Mailgun API key** in DigitalOcean app settings
2. **Verify domain** in Mailgun dashboard
3. **Test the contact form** to ensure emails are being sent
4. **Monitor email delivery** and adjust as needed

The contact form is now ready to send professional email notifications to `support@tetrixcorp.com` once the Mailgun configuration is complete!
