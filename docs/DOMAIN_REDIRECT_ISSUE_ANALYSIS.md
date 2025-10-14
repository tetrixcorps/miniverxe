# 🔍 Domain Redirect Issue Analysis

**Date:** January 15, 2025  
**Issue:** Both `joromi.ai` and `poisonedreligion.ai` redirect to TETRIX landing page instead of their respective applications

---

## 🚨 **Root Cause Identified**

### **Problem: Incorrect Domain Configuration in DigitalOcean App Platform**

Both `joromi.ai` and `poisonedreligion.ai` are configured as **PRIMARY domains** pointing to the **same TETRIX application** instead of their respective applications.

**Current Configuration (INCORRECT):**
```yaml
domains:
- domain: joromi.ai
  type: PRIMARY          # ❌ WRONG - Points to TETRIX app
- domain: poisonedreligion.ai
  type: PRIMARY          # ❌ WRONG - Points to TETRIX app
```

**Evidence:**
- Both domains resolve to the same DigitalOcean app origin: `a7c967a8-ad70-4fbe-b0a5-55c0bfaea21e`
- Both serve the TETRIX landing page content
- Both have the same `x-do-app-origin` header

---

## 🔧 **Solution: Correct Domain Configuration**

### **Option 1: Separate Applications (RECOMMENDED)**

Create separate DigitalOcean applications for JoRoMi and Code Academy:

#### **JoRoMi Application**
```yaml
name: joromi-production
domains:
- domain: joromi.ai
  type: PRIMARY
- domain: www.joromi.ai
  type: ALIAS
services:
- name: joromi-frontend
  # JoRoMi specific configuration
```

#### **Code Academy Application**
```yaml
name: code-academy-production
domains:
- domain: poisonedreligion.ai
  type: PRIMARY
- domain: www.poisonedreligion.ai
  type: ALIAS
services:
- name: code-academy-frontend
  # Code Academy specific configuration
```

### **Option 2: Single Application with Subdomain Routing**

Keep one application but use subdomains:

```yaml
domains:
- domain: tetrixcorp.com
  type: PRIMARY
- domain: joromi.tetrixcorp.com
  type: ALIAS
- domain: code-academy.tetrixcorp.com
  type: ALIAS
```

---

## 📋 **Implementation Steps**

### **Step 1: Create JoRoMi Application**

1. **Create new DigitalOcean App:**
   ```bash
   doctl apps create --spec joromi-app-spec.yaml
   ```

2. **Configure JoRoMi-specific domains:**
   ```yaml
   domains:
   - domain: joromi.ai
     type: PRIMARY
   - domain: www.joromi.ai
     type: ALIAS
   ```

3. **Deploy JoRoMi application to the new app**

### **Step 2: Create Code Academy Application**

1. **Create new DigitalOcean App:**
   ```bash
   doctl apps create --spec code-academy-app-spec.yaml
   ```

2. **Configure Code Academy-specific domains:**
   ```yaml
   domains:
   - domain: poisonedreligion.ai
     type: PRIMARY
   - domain: www.poisonedreligion.ai
     type: ALIAS
   ```

3. **Deploy Code Academy application to the new app**

### **Step 3: Update TETRIX Application**

Remove the conflicting domains from the TETRIX application:

```yaml
domains:
- domain: tetrixcorp.com
  type: PRIMARY
- domain: www.tetrixcorp.com
  type: ALIAS
- domain: api.tetrixcorp.com
  type: ALIAS
- domain: iot.tetrixcorp.com
  type: ALIAS
- domain: vpn.tetrixcorp.com
  type: ALIAS
# Remove joromi.ai and poisonedreligion.ai
```

---

## 🔄 **Alternative: Middleware-Based Solution**

If you prefer to keep everything in one application, implement domain-based routing in the middleware:

### **Updated Middleware Logic**

```javascript
// src/middleware.js
export function onRequest(context, next) {
  const hostname = context.request.headers.get('host') || '';
  
  // Handle JoRoMi domain
  if (hostname === 'joromi.ai' || hostname === 'www.joromi.ai') {
    // Redirect to JoRoMi application or serve JoRoMi content
    return new Response(null, {
      status: 302,
      headers: {
        'Location': 'https://joromi.tetrixcorp.com'
      }
    });
  }
  
  // Handle Code Academy domain
  if (hostname === 'poisonedreligion.ai' || hostname === 'www.poisonedreligion.ai') {
    // Redirect to Code Academy application or serve Code Academy content
    return new Response(null, {
      status: 302,
      headers: {
        'Location': 'https://code-academy.tetrixcorp.com'
      }
    });
  }
  
  // Continue with TETRIX logic
  return next();
}
```

---

## 🎯 **Recommended Approach**

### **Option 1: Separate Applications (BEST)**

**Pros:**
- Clean separation of concerns
- Independent deployments
- Better performance and scalability
- Easier maintenance

**Cons:**
- More complex infrastructure
- Higher costs (3 separate apps)

### **Option 2: Subdomain Routing (COST-EFFECTIVE)**

**Pros:**
- Single application
- Lower costs
- Centralized management

**Cons:**
- More complex routing logic
- Potential performance issues
- Harder to scale independently

---

## 🚀 **Immediate Action Required**

1. **Remove conflicting domains** from TETRIX application
2. **Create separate applications** for JoRoMi and Code Academy
3. **Update DNS records** to point to correct applications
4. **Test domain resolution** and functionality

---

## 📊 **Current Status**

| Domain | Current Status | Correct Status | Action Required |
|--------|----------------|----------------|-----------------|
| `joromi.ai` | ❌ Points to TETRIX | ✅ Should point to JoRoMi | Create JoRoMi app |
| `poisonedreligion.ai` | ❌ Points to TETRIX | ✅ Should point to Code Academy | Create Code Academy app |
| `tetrixcorp.com` | ✅ Points to TETRIX | ✅ Correct | No action needed |

---

## 🔧 **Next Steps**

1. **Create JoRoMi application specification**
2. **Create Code Academy application specification**
3. **Deploy separate applications**
4. **Update domain configurations**
5. **Test all domain redirects**

---

**Document Version:** 1.0  
**Last Updated:** January 15, 2025  
**Status:** Ready for Implementation  
**Priority:** HIGH
