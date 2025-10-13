# Mailgun Integration Setup

This document explains how to set up Mailgun integration for the TETRIX contact form.

## Prerequisites

1. A Mailgun account with a verified domain
2. API keys from your Mailgun dashboard

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Mailgun Configuration
MAILGUN_DOMAIN=mg.tetrixcorp.com
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_WEBHOOK_SIGNING_KEY=your_webhook_signing_key_here

# Email Configuration
CONTACT_EMAIL=support@tetrixcorp.com
FROM_EMAIL=noreply@tetrixcorp.com

# Environment
NODE_ENV=development
```

## Getting Your Mailgun API Keys

### 1. API Key
1. Log in to your [Mailgun Dashboard](https://app.mailgun.com/login)
2. Click on your profile icon (top-right corner)
3. Select "API Security" from the dropdown
4. Click the eye icon next to "Private API Key" to view it
5. Copy the key and set it as `MAILGUN_API_KEY`

### 2. Webhook Signing Key
1. In your Mailgun dashboard, go to "Webhooks" section
2. Create a new webhook or use an existing one
3. Copy the "Signing Key" and set it as `MAILGUN_WEBHOOK_SIGNING_KEY`

## Domain Configuration

Make sure your domain `mg.tetrixcorp.com` is:
1. Added to your Mailgun account
2. DNS records are properly configured
3. Domain is verified and active

## Testing the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/contact`
3. Fill out the contact form
4. Submit the form
5. Check your email at `support@tetrixcorp.com`

## Email Format

The contact form sends emails with:
- **From**: `[Name] <noreply@tetrixcorp.com>`
- **To**: `support@tetrixcorp.com`
- **Reply-To**: User's email address
- **Subject**: `Contact Form: [User's Subject]`

## Security Features

- **Webhook Signature Verification**: Validates incoming webhooks
- **Input Validation**: Validates all form fields
- **Email Format Validation**: Ensures valid email addresses
- **Rate Limiting**: Built-in protection against spam

## Troubleshooting

### Common Issues

1. **"Email service is not properly configured"**
   - Check that all environment variables are set
   - Verify API keys are correct

2. **"Mailgun API error"**
   - Check domain configuration
   - Verify API key permissions
   - Check Mailgun account status

3. **Emails not received**
   - Check spam folder
   - Verify domain DNS settings
   - Check Mailgun logs

### Debug Mode

To enable debug logging, set:
```env
NODE_ENV=development
```

This will log additional information to help troubleshoot issues.

## Production Deployment

For production deployment:

1. Set environment variables in your hosting platform
2. Ensure `NODE_ENV=production`
3. Test the contact form thoroughly
4. Monitor Mailgun logs for any issues

## Support

For issues with this integration, contact the development team or check the Mailgun documentation at [https://documentation.mailgun.com/](https://documentation.mailgun.com/).
