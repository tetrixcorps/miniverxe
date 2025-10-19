// Error Reporting API Endpoint
// Collects and stores error reports from the application

import type { APIRoute } from 'astro';

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  errorId: string;
  timestamp: string;
  userAgent: string;
  url: string;
  component?: string;
  context?: string;
  retryCount?: number;
}

interface ErrorReportResponse {
  success: boolean;
  errorId: string;
  message: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const errorReport: ErrorReport = await request.json();
    
    // Validate required fields
    if (!errorReport.message || !errorReport.errorId || !errorReport.timestamp) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required fields: message, errorId, timestamp'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log error report (in production, you would store this in a database)
    console.error('Error Report Received:', {
      errorId: errorReport.errorId,
      component: errorReport.component || 'unknown',
      message: errorReport.message,
      url: errorReport.url,
      timestamp: errorReport.timestamp
    });

    // In a real application, you would:
    // 1. Store the error report in a database
    // 2. Send alerts for critical errors
    // 3. Aggregate error statistics
    // 4. Send to external error tracking services (Sentry, Bugsnag, etc.)

    // Example: Send to external service
    if (process.env.SENTRY_DSN) {
      // Send to Sentry
      try {
        await fetch('https://sentry.io/api/0/projects/YOUR_PROJECT_ID/store/', {
          method: 'POST',
          headers: {
            'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${process.env.SENTRY_DSN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: errorReport.message,
            stacktrace: {
              frames: errorReport.stack ? errorReport.stack.split('\n').map(line => ({
                filename: line.trim()
              })) : []
            },
            extra: {
              component: errorReport.component,
              context: errorReport.context,
              userAgent: errorReport.userAgent,
              url: errorReport.url
            },
            tags: {
              component: errorReport.component || 'unknown',
              errorId: errorReport.errorId
            }
          })
        });
      } catch (sentryError) {
        console.error('Failed to send to Sentry:', sentryError);
      }
    }

    // Example: Send to Slack (for critical errors)
    if (process.env.SLACK_WEBHOOK_URL && errorReport.message.includes('CRITICAL')) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: `🚨 Critical Error in ${errorReport.component || 'Unknown Component'}`,
            attachments: [{
              color: 'danger',
              fields: [
                {
                  title: 'Error Message',
                  value: errorReport.message,
                  short: false
                },
                {
                  title: 'Component',
                  value: errorReport.component || 'Unknown',
                  short: true
                },
                {
                  title: 'URL',
                  value: errorReport.url,
                  short: true
                },
                {
                  title: 'Error ID',
                  value: errorReport.errorId,
                  short: true
                },
                {
                  title: 'Timestamp',
                  value: errorReport.timestamp,
                  short: true
                }
              ]
            }]
          })
        });
      } catch (slackError) {
        console.error('Failed to send to Slack:', slackError);
      }
    }

    // Example: Store in database (replace with your actual database logic)
    // await db.errorReports.create({
    //   errorId: errorReport.errorId,
    //   message: errorReport.message,
    //   stack: errorReport.stack,
    //   componentStack: errorReport.componentStack,
    //   component: errorReport.component,
    //   context: errorReport.context,
    //   userAgent: errorReport.userAgent,
    //   url: errorReport.url,
    //   timestamp: new Date(errorReport.timestamp),
    //   retryCount: errorReport.retryCount || 0
    // });

    const response: ErrorReportResponse = {
      success: true,
      errorId: errorReport.errorId,
      message: 'Error report received successfully'
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing error report:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to process error report',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
