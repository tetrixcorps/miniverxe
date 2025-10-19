# TETRIX Debugging Guide

This guide provides comprehensive debugging tools and techniques for the TETRIX application.

## 🚀 Quick Start

### 1. Health Checks
Monitor the health of all external services:
```bash
# Check all services
curl http://localhost:8080/api/health/check

# Check specific service
curl http://localhost:8080/api/health/check?service=stripe
```

### 2. Performance Monitoring
View real-time performance metrics:
```bash
# View performance dashboard
open http://localhost:8080/performance-dashboard
```

### 3. Error Tracking
Monitor application errors:
```bash
# View error reports
curl http://localhost:8080/api/errors/report
```

## 🔧 Debugging Tools

### Health Check System

#### Health Check API
- **Endpoint**: `/api/health/check`
- **Methods**: GET
- **Parameters**: 
  - `service` (optional): Check specific service
- **Response**: JSON with service status and metrics

#### Supported Services
- Database
- Stripe (Payment processing)
- Telnyx (Voice/SMS)
- Sinch (Chat)
- Mailgun (Email)
- OpenAI (AI services)

#### Health Dashboard Component
```tsx
import HealthDashboard from '@/components/health/HealthDashboard';

<HealthDashboard 
  refreshInterval={30000}
  showDetails={true}
  className="my-4"
/>
```

### Error Boundary System

#### Global Error Boundary
```tsx
import ErrorBoundary from '@/components/error/ErrorBoundary';

<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error('Global error:', error, errorInfo);
  }}
  resetOnPropsChange={true}
>
  <YourComponent />
</ErrorBoundary>
```

#### Component-Specific Error Boundary
```tsx
import ComponentErrorBoundary from '@/components/error/ComponentErrorBoundary';

<ComponentErrorBoundary
  componentName="UserProfile"
  onError={(error, errorInfo, componentName) => {
    console.error(`Error in ${componentName}:`, error);
  }}
>
  <UserProfile />
</ComponentErrorBoundary>
```

#### Error Handling Hooks
```tsx
import { useErrorHandler, useAsyncErrorHandler, useAPIErrorHandler } from '@/hooks/useErrorHandler';

// Basic error handling
const { errorState, handleError, clearError } = useErrorHandler('MyComponent');

// Async error handling
const { errorState, handleAsyncError } = useAsyncErrorHandler('MyComponent');

// API error handling
const { errorState, handleAPIError } = useAPIErrorHandler('MyComponent');
```

### Performance Monitoring System

#### Performance Monitor Service
```tsx
import { performanceMonitor } from '@/services/performance/PerformanceMonitor';

// Track API call
const metricId = performanceMonitor.trackAPICall('/api/users', 'GET');
// ... make API call
performanceMonitor.completeAPICall(metricId, 200, 1024, 'success');

// Track user action
const actionId = performanceMonitor.trackUserAction('button_click', 'submit-button');
// ... handle action
performanceMonitor.completeUserAction(actionId, 'success');
```

#### Performance Monitoring Hooks
```tsx
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const {
  trackAPICall,
  completeAPICall,
  trackUserAction,
  completeUserAction,
  getPerformanceSummary
} = usePerformanceMonitor({
  componentName: 'MyComponent',
  trackRenders: true,
  trackUserActions: true,
  trackAPI: true
});
```

#### API Monitor
```tsx
import { apiMonitor } from '@/services/performance/APIMonitor';

// Monitor API calls with automatic retry and timeout
const response = await apiMonitor.get('/api/users', {
  timeout: 5000,
  retries: 3,
  componentName: 'UserList'
});

// Check performance data
console.log('API Performance:', response.performance);
```

#### Performance Dashboard Component
```tsx
import PerformanceDashboard from '@/components/performance/PerformanceDashboard';

<PerformanceDashboard 
  refreshInterval={10000}
  showDetails={true}
  className="my-4"
/>
```

## 🐛 Common Issues & Solutions

### 1. Authentication Issues

#### Problem: 2FA Modal not opening
**Solution**: Ensure the modal is included in MainLayout.astro:
```astro
import TwoFAModal from '../auth/2FAModal.astro';

<TwoFAModal />
```

#### Problem: Buttons not responding
**Solution**: Check if the `open2FAModal` function is available globally:
```javascript
// In browser console
console.log(typeof window.open2FAModal); // Should be 'function'
```

### 2. Dashboard Issues

#### Problem: "Internal server error" on dashboards
**Solution**: Check health status of external services:
```bash
curl http://localhost:8080/api/health/check?service=stripe
```

#### Problem: Components not rendering
**Solution**: Wrap components with error boundaries:
```tsx
<ComponentErrorBoundary componentName="Dashboard">
  <DashboardComponent />
</ComponentErrorBoundary>
```

### 3. API Issues

#### Problem: API calls timing out
**Solution**: Use the API monitor with retry logic:
```tsx
const response = await apiMonitor.get('/api/data', {
  timeout: 10000,
  retries: 3,
  retryDelay: 2000
});
```

#### Problem: API errors not being caught
**Solution**: Use error handling hooks:
```tsx
const { handleAPIError } = useAPIErrorHandler('MyComponent');

const data = await handleAPIError(
  () => fetch('/api/data'),
  'fetching user data'
);
```

### 4. Performance Issues

#### Problem: Slow component renders
**Solution**: Monitor component performance:
```tsx
const { trackUserAction } = usePerformanceMonitor({
  componentName: 'SlowComponent',
  trackRenders: true
});
```

#### Problem: Slow API calls
**Solution**: Check performance dashboard and optimize:
```tsx
// View slowest APIs
const summary = performanceMonitor.getPerformanceSummary();
console.log('Slowest APIs:', summary.slowestAPIs);
```

## 📊 Monitoring & Analytics

### Health Monitoring
- **Real-time status**: All external services
- **Response times**: API performance metrics
- **Error rates**: Service reliability
- **Uptime tracking**: System availability

### Performance Analytics
- **API call metrics**: Duration, success rate, retry count
- **Component render times**: React component performance
- **User action tracking**: Interaction analytics
- **Navigation performance**: Page load times

### Error Tracking
- **Error aggregation**: Grouped by component and type
- **Stack traces**: Detailed error information
- **User context**: Browser, URL, user agent
- **Retry patterns**: Error recovery attempts

## 🔍 Debugging Workflow

### 1. Check System Health
```bash
# Quick health check
curl http://localhost:8080/api/health/check | jq '.overall'

# Detailed service status
curl http://localhost:8080/api/health/check | jq '.services[]'
```

### 2. Monitor Performance
```bash
# View performance metrics
curl http://localhost:8080/api/performance/metrics

# Check recent errors
curl http://localhost:8080/api/errors/report
```

### 3. Debug Components
```tsx
// Add error boundaries
<ErrorBoundary>
  <ComponentErrorBoundary componentName="ProblematicComponent">
    <ProblematicComponent />
  </ComponentErrorBoundary>
</ErrorBoundary>

// Add performance monitoring
const { trackUserAction } = usePerformanceMonitor({
  componentName: 'ProblematicComponent'
});
```

### 4. Debug API Calls
```tsx
// Use API monitor
const response = await apiMonitor.get('/api/endpoint', {
  componentName: 'MyComponent'
});

// Check performance
console.log('API Performance:', response.performance);
```

## 🚨 Alerts & Notifications

### Health Alerts
- Service down notifications
- High error rate alerts
- Performance degradation warnings

### Error Alerts
- Critical error notifications
- Component failure alerts
- API error rate monitoring

### Performance Alerts
- Slow API call warnings
- Component render time alerts
- High retry rate notifications

## 📈 Best Practices

### 1. Error Handling
- Always wrap components with error boundaries
- Use error handling hooks for async operations
- Log errors with context and user information
- Provide fallback UI for error states

### 2. Performance Monitoring
- Track all API calls with performance metrics
- Monitor component render times
- Use performance hooks in React components
- Set up alerts for performance degradation

### 3. Health Monitoring
- Check service health before making calls
- Implement circuit breakers for failing services
- Monitor external service response times
- Set up automated health checks

### 4. Debugging
- Use browser dev tools for client-side debugging
- Check server logs for API issues
- Monitor performance dashboard for bottlenecks
- Use error tracking for production issues

## 🔧 Configuration

### Environment Variables
```bash
# Health check configuration
STRIPE_SECRET_KEY=sk_test_...
TELNYX_API_KEY=KEY...
SINCH_API_TOKEN=token...
MAILGUN_API_KEY=key...
OPENAI_API_KEY=sk-...

# Error reporting
SENTRY_DSN=https://...
SLACK_WEBHOOK_URL=https://...

# Analytics
ANALYTICS_ENDPOINT=https://...
ANALYTICS_API_KEY=key...
```

### Performance Settings
```tsx
// Configure performance monitor
performanceMonitor.setEnabled(true);

// Configure API monitor
apiMonitor.setDefaultOptions({
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  trackPerformance: true
});
```

## 📚 Additional Resources

- [Error Boundary Documentation](https://reactjs.org/docs/error-boundaries.html)
- [Performance Monitoring Best Practices](https://web.dev/performance-monitoring/)
- [Health Check Patterns](https://microservices.io/patterns/observability/health-check.html)
- [API Monitoring Strategies](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/api-monitoring.html)

---

For more help, check the console logs, performance dashboard, and health check endpoints. All debugging tools are designed to work together to provide comprehensive visibility into your application's health and performance.
