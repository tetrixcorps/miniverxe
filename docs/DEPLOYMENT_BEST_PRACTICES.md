# TETRIX Production Deployment Best Practices

This document outlines the best practices implemented for the TETRIX production deployment on DigitalOcean App Platform.

## 🏗️ Architecture Overview

### Current Setup
- **Platform**: DigitalOcean App Platform
- **Runtime**: Node.js 18+ with Astro.js SSR
- **Instances**: 2 replicas on `professional-xs` (High Availability)
- **Region**: Frankfurt (fra)
- **Package Manager**: pnpm@10.18.3 (pinned for consistency)

### Cost Analysis
- **Instance Size**: professional-xs (~$12/month per instance)
- **Total Instances**: 2
- **Monthly Cost**: ~$24/month
- **Previous Cost**: ~$5/month (single basic-xxs)
- **Cost Increase**: +$19/month for HA setup

## 🔧 Implemented Best Practices

### 1. High Availability (HA)
- **Multiple Replicas**: 2 instances for redundancy
- **Instance Size**: professional-xs supports multiple replicas
- **Health Checks**: Comprehensive health monitoring at `/api/health`
- **Graceful Shutdown**: Proper cleanup during deployments

### 2. Enhanced Health Monitoring
```typescript
// Comprehensive health check endpoint
interface HealthCheckData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  checks: {
    database: 'pass' | 'fail' | 'unknown';
    telnyx: 'pass' | 'fail' | 'unknown';
    sinch: 'pass' | 'fail' | 'unknown';
    firebase: 'pass' | 'fail' | 'unknown';
  };
  instance: {
    id: string;
    region: string;
    replicas: number;
  };
}
```

### 3. Caching Strategy
- **Static Assets**: 1 year cache with immutable flag
- **API Responses**: No cache for real-time data
- **HTML Pages**: 5-minute cache with 1-hour CDN cache
- **Health Checks**: No cache for accurate monitoring

### 4. Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### 5. Build Consistency
- **Pinned pnpm**: `pnpm@10.18.3` in package.json
- **Clean Builds**: `build: { clean: true }` in astro.config.mjs
- **Frozen Lockfile**: `pnpm install --frozen-lockfile` in build command

### 6. Graceful Shutdown
```typescript
// Graceful shutdown handler
class GracefulShutdown {
  private handlers: ShutdownHandler[] = [];
  private isShuttingDown = false;
  private shutdownTimeout = 30000; // 30 seconds

  // Handles SIGTERM, SIGINT, uncaught exceptions
  // Executes cleanup handlers with timeouts
  // Forces exit if timeout exceeded
}
```

### 7. DNS Management
- **Removed Problematic Domains**: Cleaned up CNAME mismatches
- **Active Domains**: 
  - `tetrixcorp.com` (PRIMARY)
  - `joromi.tetrixcorp.com` (ALIAS)
  - `code-academy.tetrixcorp.com` (ALIAS)

### 8. Environment Variables
- **Sensitive Values**: Moved to SECRET scope (where possible)
- **Build-time Variables**: Properly scoped
- **Runtime Variables**: Secured and validated

## 📊 Monitoring & Observability

### Health Check Endpoint
- **URL**: `https://tetrix-minimal-uzzxn.ondigitalocean.app/api/health`
- **Response Time**: <1s target
- **Memory Monitoring**: Real-time usage tracking
- **Service Checks**: Database, Telnyx, Sinch, Firebase connectivity

### Monitoring Scripts
```bash
# Comprehensive monitoring
./scripts/monitor-app.sh

# Specific checks
./scripts/monitor-app.sh health
./scripts/monitor-app.sh performance
./scripts/monitor-app.sh logs
```

### Deployment Script
```bash
# Best practices deployment
./scripts/deploy-with-best-practices.sh
```

## 🚀 Deployment Process

### 1. Pre-deployment Checks
- doctl authentication
- App spec validation
- pnpm availability
- Backup current spec

### 2. Deployment Steps
- Update app spec
- Monitor deployment progress
- Verify app instances
- Test health endpoint
- Check domain status
- Performance validation

### 3. Post-deployment Verification
- Health check response
- Instance count verification
- Domain status check
- Performance metrics
- Error log review

## 🔍 Troubleshooting

### Common Issues

#### 1. CNAME Mismatch
```bash
# Check domain status
doctl apps get $APP_ID -o json | jq '.[0].domains[] | select(.phase != "ACTIVE")'

# Fix: Update DNS records to point to default ingress
# Default ingress: https://tetrix-minimal-uzzxn.ondigitalocean.app
```

#### 2. Health Check Failures
```bash
# Check health endpoint
curl -v https://tetrix-minimal-uzzxn.ondigitalocean.app/api/health

# Check app logs
doctl apps logs $APP_ID --type run --tail 50
```

#### 3. Performance Issues
```bash
# Check response times
./scripts/monitor-app.sh performance

# Check instance status
doctl apps list-instances $APP_ID
```

### Rollback Procedure
```bash
# Restore from backup
doctl apps update $APP_ID --spec $BACKUP_SPEC_FILE

# Or revert to previous deployment
doctl apps create-deployment $APP_ID --force-rebuild
```

## 📈 Performance Metrics

### Target Metrics
- **Response Time**: <1s for API, <3s for pages
- **Uptime**: 99.9% availability
- **Memory Usage**: <80% per instance
- **Health Check**: <500ms response time

### Monitoring Tools
- DigitalOcean App Platform metrics
- Custom health check endpoint
- Application logs via doctl
- Performance monitoring script

## 🔐 Security Considerations

### Implemented Security
- Security headers on all responses
- CORS configuration for API routes
- Environment variable protection
- Graceful error handling

### Recommendations for Production
1. **Secrets Management**: Use DigitalOcean Secrets for sensitive data
2. **WAF**: Consider Web Application Firewall
3. **DDoS Protection**: Enable DDoS protection
4. **SSL/TLS**: Automatic SSL certificates via Let's Encrypt
5. **Backup Strategy**: Regular database backups

## 📋 Maintenance Tasks

### Daily
- Monitor health check endpoint
- Check error logs
- Verify instance status

### Weekly
- Review performance metrics
- Check domain status
- Update dependencies (if needed)

### Monthly
- Review cost optimization
- Security audit
- Performance analysis

## 🎯 Future Improvements

### Short Term
1. **Autoscaling**: Implement based on CPU/memory usage
2. **CDN**: Add CDN for static assets
3. **Database Monitoring**: Real database connectivity checks

### Long Term
1. **Microservices**: Split API into separate service
2. **Container Registry**: Use DigitalOcean Container Registry
3. **Kubernetes**: Migrate to DigitalOcean Kubernetes

## 📞 Support & Contacts

- **App ID**: `ca96485c-ee6b-401b-b1a2-8442c3bc7f04`
- **Health URL**: `https://tetrix-minimal-uzzxn.ondigitalocean.app/api/health`
- **Main URL**: `https://tetrix-minimal-uzzxn.ondigitalocean.app`

## 📚 References

- [DigitalOcean App Platform Documentation](https://docs.digitalocean.com/products/app-platform/)
- [Astro.js SSR Documentation](https://docs.astro.build/en/guides/server-side-rendering/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Production Deployment Checklist](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/deployment.md)
