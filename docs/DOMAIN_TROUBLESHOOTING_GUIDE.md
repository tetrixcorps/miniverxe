# 🌐 Domain Configuration Troubleshooting Guide

## Current Status
- **Droplet IP:** 207.154.193.187
- **Application Status:** ✅ Running and accessible via IP
- **Issue:** Domain name returns "External service temporarily unavailable"

---

## 🔍 **Step-by-Step Troubleshooting**

### 1. **Verify Domain DNS Configuration**

Your domain needs an A record pointing to the droplet's IP address:

```
Type: A
Name: @ (or your subdomain)
Value: 207.154.193.187
TTL: 300 (or 3600)
```

**Common DNS Providers:**
- **Cloudflare:** DNS → Records → Add A record
- **GoDaddy:** DNS Management → Add A record
- **Namecheap:** Advanced DNS → Add A record
- **Route 53:** Hosted Zone → Create Record

### 2. **Check DNS Propagation**

Use these tools to check if your domain is resolving correctly:

**Online DNS Checkers:**
- https://dnschecker.org/
- https://whatsmydns.net/
- https://dns.google/

**Command Line (if available):**
```bash
# Check if domain resolves to correct IP
nslookup yourdomain.com
dig yourdomain.com
```

### 3. **Test Different Access Methods**

**Direct IP Access (Should Work):**
- http://207.154.193.187:8081/ (Direct application)
- http://207.154.193.187:8082/ (Nginx proxy)

**Domain Access (May not work yet):**
- http://yourdomain.com:8081/
- http://yourdomain.com:8082/

### 4. **Common Issues & Solutions**

#### **Issue: "External service temporarily unavailable"**
**Causes:**
- DNS not pointing to correct IP
- DNS propagation delay
- Domain registrar issues
- CDN/proxy configuration

**Solutions:**
1. Verify A record points to `207.154.193.187`
2. Wait for DNS propagation (up to 48 hours)
3. Clear browser cache and DNS cache
4. Try different DNS servers (8.8.8.8, 1.1.1.1)

#### **Issue: Domain resolves but shows error**
**Causes:**
- Nginx configuration issue
- Port configuration
- SSL/HTTPS redirect issues

**Solutions:**
1. Check Nginx configuration
2. Verify port 80/443 are open
3. Check SSL certificate configuration

### 5. **Quick Fixes to Try**

#### **Option A: Use IP Address Temporarily**
While waiting for DNS propagation, you can:
1. Access via IP: http://207.154.193.187:8081/
2. Share the IP link with users
3. Set up a redirect from your domain to the IP

#### **Option B: Update Nginx Configuration**
If your domain is resolving but not working, update the Nginx config:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Rest of your configuration...
}
```

#### **Option C: Add Domain to Nginx**
Update the Nginx configuration to accept your domain:

```bash
# SSH into the droplet
doctl compute ssh tetrix-production --ssh-key-path ~/.ssh/tetrix_droplet_key

# Edit Nginx configuration
cd /opt/tetrix
nano nginx/nginx.conf

# Update server_name line:
server_name yourdomain.com www.yourdomain.com;

# Restart Nginx
docker-compose -f docker-compose.production.yml restart nginx
```

### 6. **Verify Configuration**

**Check if your domain resolves:**
```bash
# Test DNS resolution
nslookup yourdomain.com
dig yourdomain.com

# Test HTTP access
curl -I http://yourdomain.com
curl -I http://yourdomain.com:8081
curl -I http://yourdomain.com:8082
```

**Check Nginx logs:**
```bash
# SSH into droplet
doctl compute ssh tetrix-production --ssh-key-path ~/.ssh/tetrix_droplet_key

# Check Nginx logs
cd /opt/tetrix
docker-compose -f docker-compose.production.yml logs nginx
```

---

## 🚀 **Immediate Solutions**

### **Solution 1: Use IP Address**
Access your application directly:
- **Main App:** http://207.154.193.187:8081/
- **Nginx Proxy:** http://207.154.193.187:8082/

### **Solution 2: Configure Domain**
1. **Update DNS A record** to point to `207.154.193.187`
2. **Wait for propagation** (usually 15 minutes to 48 hours)
3. **Test domain access** once DNS propagates

### **Solution 3: Update Nginx for Domain**
If your domain is resolving but not working:

```bash
# SSH into droplet
doctl compute ssh tetrix-production --ssh-key-path ~/.ssh/tetrix_droplet_key

# Update Nginx configuration
cd /opt/tetrix
sed -i 's/server_name _;/server_name yourdomain.com www.yourdomain.com;/' nginx/nginx.conf

# Restart services
docker-compose -f docker-compose.production.yml restart nginx
```

---

## 📞 **Need Help?**

If you're still experiencing issues:

1. **Check your domain registrar's DNS settings**
2. **Verify the A record is pointing to 207.154.193.187**
3. **Wait for DNS propagation (up to 48 hours)**
4. **Try accessing via IP address in the meantime**

**Your application is working perfectly via IP address, so the issue is definitely DNS/domain configuration related.**

---

**Current Working URLs:**
- ✅ http://207.154.193.187:8081/ (Direct access)
- ✅ http://207.154.193.187:8082/ (Nginx proxy)
- ⏳ http://yourdomain.com (Pending DNS configuration)
