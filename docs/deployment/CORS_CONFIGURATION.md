# Cross-Platform CORS Configuration

## Overview

This document outlines the CORS (Cross-Origin Resource Sharing) configuration for the TETRIX cross-platform management system, ensuring secure communication between TETRIX, JoRoMi, and GLO components.

## Production Domains

### Primary Domains
- **TETRIX**: `https://tetrixcorp.com`
- **JoRoMi**: `https://joromi.ai`
- **GLO M2M**: `https://iot.tetrixcorp.com`

### API Domains
- **TETRIX API**: `https://api.tetrixcorp.com`
- **JoRoMi API**: `https://api.joromi.ai`
- **GLO VPN**: `https://vpn.tetrixcorp.com`

## CORS Configuration by Component

### 1. TETRIX API Service
```javascript
// services/api/src/index.ts
app.use(cors({
  origin: [
    'https://tetrixcorp.com',
    'https://joromi.ai', 
    'https://iot.tetrixcorp.com',
    'https://api.tetrixcorp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
}));
```

### 2. JoRoMi Backend
```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tetrixcorp.com",
        "https://joromi.ai",
        "https://iot.tetrixcorp.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. GLO M2M Services
```javascript
// m2m-auth-service/src/index.ts
app.use(cors({
  origin: [
    'https://tetrixcorp.com',
    'https://joromi.ai',
    'https://iot.tetrixcorp.com',
    'https://api.tetrixcorp.com',
    'https://vpn.tetrixcorp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Device-ID', 'X-API-Key']
}));
```

## Environment Variables

### TETRIX Environment
```bash
# .env
ALLOWED_ORIGINS=https://tetrixcorp.com,https://joromi.ai,https://iot.tetrixcorp.com
CORS_CREDENTIALS=true
```

### JoRoMi Environment
```bash
# backend/.env
ALLOWED_HOSTS=https://tetrixcorp.com,https://joromi.ai,https://iot.tetrixcorp.com
CORS_ORIGINS=https://tetrixcorp.com,https://joromi.ai,https://iot.tetrixcorp.com
```

### GLO M2M Environment
```bash
# glo/.env
ALLOWED_ORIGINS=https://tetrixcorp.com,https://joromi.ai,https://iot.tetrixcorp.com,https://api.tetrixcorp.com,https://vpn.tetrixcorp.com
M2M_CORS_CREDENTIALS=true
```

## Security Considerations

### 1. Production Restrictions
- ✅ **Specific Origins**: Only allow known production domains
- ✅ **Credentials**: Enable for authenticated requests
- ✅ **Methods**: Restrict to necessary HTTP methods
- ✅ **Headers**: Limit allowed headers to required ones

### 2. Development Overrides
```javascript
// Development CORS (only in dev environment)
const devOrigins = process.env.NODE_ENV === 'development' ? [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:3001'
] : [];

const allowedOrigins = [
  'https://tetrixcorp.com',
  'https://joromi.ai',
  'https://iot.tetrixcorp.com',
  ...devOrigins
];
```

### 3. Nginx Configuration
```nginx
# nginx.conf
location / {
    add_header Access-Control-Allow-Origin "https://tetrixcorp.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
    add_header Access-Control-Allow-Credentials "true" always;
    
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "https://tetrixcorp.com" always;
        add_header Access-Control-Max-Age 1728000;
        add_header Content-Type 'text/plain; charset=utf-8';
        add_header Content-Length 0;
        return 204;
    }
}
```

## Testing CORS Configuration

### 1. Browser Console Test
```javascript
// Test from tetrixcorp.com
fetch('https://api.tetrixcorp.com/health', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('CORS Test Success:', data))
.catch(error => console.error('CORS Test Failed:', error));
```

### 2. cURL Test
```bash
# Test CORS preflight
curl -H "Origin: https://tetrixcorp.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.tetrixcorp.com/health
```

### 3. Automated Test
```javascript
// tests/cors.test.js
describe('CORS Configuration', () => {
  test('should allow requests from tetrixcorp.com', async () => {
    const response = await fetch('https://api.tetrixcorp.com/health', {
      headers: { 'Origin': 'https://tetrixcorp.com' }
    });
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://tetrixcorp.com');
  });
  
  test('should reject requests from unauthorized origins', async () => {
    const response = await fetch('https://api.tetrixcorp.com/health', {
      headers: { 'Origin': 'https://malicious-site.com' }
    });
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});
```

## Troubleshooting

### Common CORS Issues

1. **Preflight Requests Failing**
   - Ensure OPTIONS method is handled
   - Check allowed headers match request headers

2. **Credentials Not Working**
   - Verify `credentials: true` in CORS config
   - Check `Access-Control-Allow-Credentials: true` header

3. **Wildcard Origins with Credentials**
   - Cannot use `*` origin with `credentials: true`
   - Must specify exact origins

### Debug Commands
```bash
# Check CORS headers
curl -I -H "Origin: https://tetrixcorp.com" https://api.tetrixcorp.com/health

# Test preflight request
curl -X OPTIONS -H "Origin: https://tetrixcorp.com" \
     -H "Access-Control-Request-Method: POST" \
     https://api.tetrixcorp.com/health
```

## Implementation Checklist

- [ ] Update TETRIX API CORS configuration
- [ ] Update JoRoMi backend CORS configuration  
- [ ] Update GLO M2M services CORS configuration
- [ ] Configure Nginx CORS headers
- [ ] Set environment variables for all services
- [ ] Test cross-domain communication
- [ ] Verify security restrictions
- [ ] Document production deployment steps
