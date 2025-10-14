# 🔧 Domain Redirect Issue - Complete Solution

**Date:** January 15, 2025  
**Issue:** Both `joromi.ai` and `poisonedreligion.ai` redirect to TETRIX landing page  
**Status:** Solution Ready for Implementation

---

## 🚨 **Problem Summary**

Both `joromi.ai` and `poisonedreligion.ai` are currently configured as **PRIMARY domains** pointing to the **same TETRIX DigitalOcean application**. This causes both domains to serve the TETRIX landing page instead of their respective applications.

**Evidence:**
- Both domains resolve to the same app origin: `a7c967a8-ad70-4fbe-b0a5-55c0bfaea21e`
- Both serve identical TETRIX content
- Both have the same `x-do-app-origin` header

---

## 🎯 **Solution: Separate Applications**

### **Approach: Create Independent Applications**

Create separate DigitalOcean applications for each platform:

1. **TETRIX Application** - `tetrixcorp.com` (existing, needs cleanup)
2. **JoRoMi Application** - `joromi.ai` (new)
3. **Code Academy Application** - `poisonedreligion.ai` (new)

---

## 📋 **Implementation Steps**

### **Step 1: Fix TETRIX Application**

Remove conflicting domains from the existing TETRIX application:

```bash
# Run the fix script
./fix-tetrix-domains.sh
```

**What this does:**
- Removes `joromi.ai` and `poisonedreligion.ai` from TETRIX app
- Keeps only TETRIX domains: `tetrixcorp.com`, `api.tetrixcorp.com`, etc.
- Updates the application configuration

### **Step 2: Create JoRoMi Application**

```bash
# Create JoRoMi application
doctl apps create --spec joromi-app-spec.yaml
```

**Configuration:**
- **Domain:** `joromi.ai` (PRIMARY)
- **Subdomain:** `www.joromi.ai` (ALIAS)
- **Services:** JoRoMi frontend + backend
- **Integration:** TETRIX 2FA API

### **Step 3: Create Code Academy Application**

```bash
# Create Code Academy application
doctl apps create --spec code-academy-app-spec.yaml
```

**Configuration:**
- **Domain:** `poisonedreligion.ai` (PRIMARY)
- **Subdomain:** `www.poisonedreligion.ai` (ALIAS)
- **Services:** Code Academy frontend + backend
- **Integration:** TETRIX 2FA API

---

## 🔧 **Technical Details**

### **TETRIX Application (Fixed)**

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
```

### **JoRoMi Application (New)**

```yaml
domains:
  - domain: joromi.ai
    type: PRIMARY
  - domain: www.joromi.ai
    type: ALIAS
```

### **Code Academy Application (New)**

```yaml
domains:
  - domain: poisonedreligion.ai
    type: PRIMARY
  - domain: www.poisonedreligion.ai
    type: ALIAS
```

---

## 🚀 **Deployment Commands**

### **1. Fix TETRIX Application**
```bash
# Make script executable
chmod +x fix-tetrix-domains.sh

# Run the fix
./fix-tetrix-domains.sh
```

### **2. Create JoRoMi Application**
```bash
# Create JoRoMi app
doctl apps create --spec joromi-app-spec.yaml

# Get the app ID
doctl apps list | grep joromi

# Deploy JoRoMi application
# (This will be handled by the GitHub integration)
```

### **3. Create Code Academy Application**
```bash
# Create Code Academy app
doctl apps create --spec code-academy-app-spec.yaml

# Get the app ID
doctl apps list | grep code-academy

# Deploy Code Academy application
# (This will be handled by the GitHub integration)
```

---

## 🔍 **Verification Steps**

### **1. Check Domain Resolution**

After deployment, verify each domain points to its correct application:

```bash
# Check TETRIX
curl -I https://tetrixcorp.com
# Should show TETRIX content

# Check JoRoMi
curl -I https://joromi.ai
# Should show JoRoMi content

# Check Code Academy
curl -I https://poisonedreligion.ai
# Should show Code Academy content
```

### **2. Test Button Redirects**

1. Visit `https://tetrixcorp.com`
2. Click "JoRoMi" button → Should redirect to `https://joromi.ai`
3. Click "Code Academy" button → Should redirect to `https://poisonedreligion.ai`

### **3. Test Cross-Platform Authentication**

1. Test 2FA flow from TETRIX to JoRoMi
2. Test 2FA flow from TETRIX to Code Academy
3. Verify session management works correctly

---

## 📊 **Expected Results**

| Domain | Before | After | Status |
|--------|--------|-------|--------|
| `tetrixcorp.com` | ✅ TETRIX | ✅ TETRIX | ✅ Correct |
| `joromi.ai` | ❌ TETRIX | ✅ JoRoMi | 🔄 Fixed |
| `poisonedreligion.ai` | ❌ TETRIX | ✅ Code Academy | 🔄 Fixed |

---

## 🛠️ **Troubleshooting**

### **If Domains Still Redirect to TETRIX**

1. **Check DNS propagation:**
   ```bash
   dig joromi.ai
   dig poisonedreligion.ai
   ```

2. **Verify app configuration:**
   ```bash
   doctl apps get <app-id>
   ```

3. **Check domain assignments:**
   ```bash
   doctl apps list-domains <app-id>
   ```

### **If Applications Don't Deploy**

1. **Check build logs:**
   ```bash
   doctl apps logs <app-id>
   ```

2. **Verify GitHub integration:**
   - Ensure repository access
   - Check branch configuration
   - Verify build commands

### **If 2FA Integration Fails**

1. **Check API endpoints:**
   ```bash
   curl https://tetrixcorp.com/api/v2/2fa/health
   ```

2. **Verify CORS configuration:**
   - Check `CORS_ORIGIN` environment variables
   - Ensure domains are whitelisted

---

## 💰 **Cost Implications**

### **Current Setup**
- **1 Application** - TETRIX only
- **Cost:** ~$12/month (basic-xxs)

### **New Setup**
- **3 Applications** - TETRIX + JoRoMi + Code Academy
- **Cost:** ~$36/month (3 × basic-xxs)
- **Additional Cost:** ~$24/month

### **Alternative: Subdomain Approach**
- **1 Application** - All platforms
- **Cost:** ~$12/month
- **Domains:** `tetrixcorp.com`, `joromi.tetrixcorp.com`, `code-academy.tetrixcorp.com`

---

## 🎯 **Recommendation**

### **Option 1: Separate Applications (RECOMMENDED)**

**Pros:**
- ✅ Clean separation of concerns
- ✅ Independent deployments
- ✅ Better performance and scalability
- ✅ Easier maintenance and debugging
- ✅ Proper domain ownership

**Cons:**
- ❌ Higher cost (~$24/month additional)
- ❌ More complex infrastructure

### **Option 2: Subdomain Approach (COST-EFFECTIVE)**

**Pros:**
- ✅ Single application
- ✅ Lower cost
- ✅ Centralized management

**Cons:**
- ❌ Less professional URLs
- ❌ More complex routing logic
- ❌ Harder to scale independently

---

## 🚀 **Ready to Execute**

All files are prepared and ready for deployment:

1. ✅ **`fix-tetrix-domains.sh`** - Fixes TETRIX application
2. ✅ **`joromi-app-spec.yaml`** - JoRoMi application spec
3. ✅ **`code-academy-app-spec.yaml`** - Code Academy application spec
4. ✅ **Documentation** - Complete implementation guide

### **Execute Now:**
```bash
# Fix TETRIX application
./fix-tetrix-domains.sh

# Create JoRoMi application
doctl apps create --spec joromi-app-spec.yaml

# Create Code Academy application
doctl apps create --spec code-academy-app-spec.yaml
```

---

**Document Version:** 1.0  
**Last Updated:** January 15, 2025  
**Status:** Ready for Implementation  
**Priority:** HIGH  
**Estimated Time:** 30-45 minutes
