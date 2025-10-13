# 🌐 Domain DNS Configuration Guide

**Date:** October 13, 2025  
**Status:** DNS Delegation Issue Identified  
**Domain:** `poisonedreligion.ai`

---

## 🚨 **Current Issue Identified**

### **Problem: DNS Delegation Conflict**
The `poisonedreligion.ai` domain has **conflicting nameserver records** that are preventing proper DNS resolution.

**Current DNS Records Analysis:**
```
❌ CONFLICTING NAMESERVERS:
- ns.poisonedreligion.ai → ns3.openprovider.eu (OpenProvider)
- ns.poisonedreligion.ai → ns1.openprovider.nl (OpenProvider)  
- ns.poisonedreligion.ai → ns2.openprovider.be (OpenProvider)

✅ HURRICANE ELECTRIC NAMESERVERS:
- poisonedreligion.ai → ns1.he.net
- poisonedreligion.ai → ns2.he.net
- poisonedreligion.ai → ns3.he.net
- poisonedreligion.ai → ns4.he.net
- poisonedreligion.ai → ns5.he.net
```

**Root Cause:** The domain has **two different nameserver configurations**:
1. **OpenProvider nameservers** (conflicting)
2. **Hurricane Electric nameservers** (correct)

---

## 🔧 **Solution: DNS Configuration Fix**

### **Step 1: Remove Conflicting Nameserver Records**

**DELETE these records from Hurricane Electric DNS:**
```
❌ DELETE:
ns.poisonedreligion.ai  NS  3600  -  ns3.openprovider.eu
ns.poisonedreligion.ai  NS  3600  -  ns1.openprovider.nl  
ns.poisonedreligion.ai  NS  3600  -  ns2.openprovider.be
```

### **Step 2: Verify Hurricane Electric Nameservers**

**KEEP these records (they are correct):**
```
✅ KEEP:
poisonedreligion.ai  NS  172800  -  ns1.he.net
poisonedreligion.ai  NS  172800  -  ns2.he.net
poisonedreligion.ai  NS  172800  -  ns3.he.net
poisonedreligion.ai  NS  172800  -  ns4.he.net
poisonedreligion.ai  NS  172800  -  ns5.he.net
```

### **Step 3: Update Domain Registrar**

**At your domain registrar (where you bought poisonedreligion.ai):**

1. **Login to your domain registrar account**
2. **Find DNS/Nameserver settings**
3. **Update nameservers to:**
   ```
   ns1.he.net
   ns2.he.net
   ns3.he.net
   ns4.he.net
   ns5.he.net
   ```

---

## 📋 **Complete DNS Configuration**

### **Hurricane Electric DNS Records (Correct Configuration)**

| Name | Type | TTL | Priority | Data | Action |
|------|------|-----|----------|------|--------|
| `poisonedreligion.ai` | SOA | 172800 | - | `ns1.he.net. hostmaster.he.net. 2025101218 86400 7200 3600000 172800` | ✅ Keep |
| `poisonedreligion.ai` | NS | 172800 | - | `ns1.he.net` | ✅ Keep |
| `poisonedreligion.ai` | NS | 172800 | - | `ns2.he.net` | ✅ Keep |
| `poisonedreligion.ai` | NS | 172800 | - | `ns3.he.net` | ✅ Keep |
| `poisonedreligion.ai` | NS | 172800 | - | `ns4.he.net` | ✅ Keep |
| `poisonedreligion.ai` | NS | 172800 | - | `ns5.he.net` | ✅ Keep |
| `poisonedreligion.ai` | A | 3600 | - | `162.159.140.98` | ✅ Keep |
| `poisonedreligion.ai` | A | 3600 | - | `172.66.0.96` | ✅ Keep |
| `www.poisonedreligion.ai` | A | 3600 | - | `162.159.140.98` | ✅ Keep |
| `www.poisonedreligion.ai` | A | 3600 | - | `172.66.0.96` | ✅ Keep |
| `aaaa.poisonedreligion.ai` | AAAA | 3600 | - | `2001:470:1f06:320::2` | ✅ Keep |

### **Records to DELETE (Conflicting)**

| Name | Type | TTL | Priority | Data | Action |
|------|------|-----|----------|------|--------|
| `ns.poisonedreligion.ai` | NS | 3600 | - | `ns3.openprovider.eu` | ❌ DELETE |
| `ns.poisonedreligion.ai` | NS | 3600 | - | `ns1.openprovider.nl` | ❌ DELETE |
| `ns.poisonedreligion.ai` | NS | 3600 | - | `ns2.openprovider.be` | ❌ DELETE |

---

## 🎯 **Implementation Steps**

### **Step 1: Clean Up Hurricane Electric DNS**
1. **Login to Hurricane Electric Free DNS**
2. **Go to Zone Management for `poisonedreligion.ai`**
3. **Delete the conflicting OpenProvider NS records:**
   - `ns.poisonedreligion.ai` → `ns3.openprovider.eu`
   - `ns.poisonedreligion.ai` → `ns1.openprovider.nl`
   - `ns.poisonedreligion.ai` → `ns2.openprovider.be`
4. **Click "Check Delegation" to verify**

### **Step 2: Update Domain Registrar**
1. **Login to your domain registrar** (where you purchased `poisonedreligion.ai`)
2. **Find "DNS Management" or "Nameservers" section**
3. **Change nameservers to Hurricane Electric:**
   ```
   Primary: ns1.he.net
   Secondary: ns2.he.net
   Tertiary: ns3.he.net
   Quaternary: ns4.he.net
   Quinary: ns5.he.net
   ```
4. **Save changes**

### **Step 3: Verify Configuration**
1. **Wait 5-10 minutes for propagation**
2. **Test domain resolution:**
   ```bash
   nslookup poisonedreligion.ai
   dig poisonedreligion.ai
   ```
3. **Test website access:**
   ```bash
   curl -I http://poisonedreligion.ai
   curl -I https://poisonedreligion.ai
   ```

---

## 🔍 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Domain Still Not Resolving**
**Cause:** Nameserver changes not propagated yet
**Solution:** Wait 24-48 hours for full propagation

#### **2. "Zone not properly delegated" Error**
**Cause:** Domain registrar still pointing to old nameservers
**Solution:** Verify nameservers at domain registrar match Hurricane Electric

#### **3. Website Not Loading**
**Cause:** A records pointing to wrong IP addresses
**Solution:** Verify A records point to correct hosting provider

### **Verification Commands**

```bash
# Check nameservers
nslookup -type=NS poisonedreligion.ai

# Check A records
nslookup poisonedreligion.ai

# Check delegation
dig @ns1.he.net poisonedreligion.ai

# Test website
curl -I http://poisonedreligion.ai
curl -I https://poisonedreligion.ai
```

---

## 📊 **Expected Results After Fix**

### **Before Fix (Current State)**
```
❌ Domain not resolving
❌ "Could not resolve host" error
❌ Conflicting nameserver records
```

### **After Fix (Expected State)**
```
✅ Domain resolves correctly
✅ Website loads properly
✅ Clean nameserver delegation
✅ All DNS records working
```

---

## 🚀 **Integration with TETRIX**

### **Code Academy Integration**
Once DNS is fixed, the Code Academy button will redirect to:
- **Production:** `https://poisonedreligion.ai`
- **Development:** `http://localhost:3001`

### **Authentication Flow**
1. User clicks "Code Academy" button
2. 2FA modal opens with Code Academy context
3. User completes phone verification
4. Redirects to `https://poisonedreligion.ai` with auth token

---

## 📞 **Support Contacts**

### **Hurricane Electric Support**
- **Website:** https://dns.he.net
- **Documentation:** https://dns.he.net/faq.html
- **Support:** Available through their web interface

### **Domain Registrar Support**
- **Contact your domain registrar** for nameserver changes
- **Common registrars:** GoDaddy, Namecheap, Cloudflare, etc.

---

## ✅ **Action Items**

### **Immediate Actions (Next 30 minutes)**
1. ✅ **Delete conflicting OpenProvider NS records** from Hurricane Electric
2. ✅ **Update nameservers** at domain registrar
3. ✅ **Click "Check Delegation"** in Hurricane Electric

### **Verification (Next 2 hours)**
1. ✅ **Test domain resolution** with nslookup/dig
2. ✅ **Test website access** with curl/browser
3. ✅ **Verify all DNS records** are correct

### **Final Testing (Next 24 hours)**
1. ✅ **Test Code Academy integration** from TETRIX
2. ✅ **Verify authentication flow** works end-to-end
3. ✅ **Monitor for any DNS issues**

---

**The DNS delegation issue is caused by conflicting nameserver records. Once the OpenProvider records are removed and the domain registrar is updated to use Hurricane Electric nameservers, the domain will resolve correctly.**
