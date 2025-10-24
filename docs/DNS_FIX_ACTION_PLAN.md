# DNS Fix Action Plan - Step by Step

## 🎯 **Current Status**
- ❌ **DNS Conflict**: Both Hurricane Electric and OpenProvider trying to be primary
- ❌ **Domain Not Resolving**: tetrixcorp.com not pointing to droplet
- ❌ **SSL Failing**: Cannot generate certificates due to DNS issues

## 📋 **Step-by-Step Fix Process**

### **Phase 1: Fix DNS Nameserver Conflict (Priority 1)**

#### **Step 1.1: Identify Your Domain Registrar**
You need to find where `tetrixcorp.com` is registered. Common registrars:
- GoDaddy
- Namecheap
- Cloudflare
- Google Domains
- Network Solutions

**Action**: Login to your domain registrar account

#### **Step 1.2: Update Nameservers at Registrar**
1. **Navigate to DNS/Nameserver settings**
2. **Remove OpenProvider nameservers**:
   - `ns1.openprovider.nl`
   - `ns2.openprovider.be` 
   - `ns3.openprovider.eu`
3. **Set ONLY Hurricane Electric nameservers**:
   - `ns1.he.net`
   - `ns2.he.net`
   - `ns3.he.net`
   - `ns4.he.net`
   - `ns5.he.net`

#### **Step 1.3: Verify Hurricane Electric Configuration**
1. **Login to Hurricane Electric**: https://dns.he.net/
2. **Check A records** are correct:
   ```
   tetrixcorp.com → 207.154.193.187
   www.tetrixcorp.com → 207.154.193.187
   api.tetrixcorp.com → 207.154.193.187
   ```

### **Phase 2: Test DNS Resolution (Priority 2)**

#### **Step 2.1: Test from Local Machine**
```bash
# Test nameserver resolution
dig tetrixcorp.com NS +short

# Test A record resolution
dig tetrixcorp.com A +short

# Test from different DNS servers
dig @8.8.8.8 tetrixcorp.com A +short
dig @1.1.1.1 tetrixcorp.com A +short
```

#### **Step 2.2: Test Domain Accessibility**
```bash
# Test HTTP access
curl -I http://tetrixcorp.com

# Should return: HTTP/1.1 200 OK
```

### **Phase 3: Set Up SSL Certificates (Priority 3)**

#### **Step 3.1: Create SSL Setup Script**
Once DNS is resolved, run the SSL setup:

```bash
# Copy SSL setup script to droplet
scp -i ~/.ssh/tetrix_droplet_key setup-ssl-simple.sh root@207.154.193.187:/root/

# Execute SSL setup
ssh -i ~/.ssh/tetrix_droplet_key root@207.154.193.187 "/root/setup-ssl-simple.sh"
```

#### **Step 3.2: Verify SSL Configuration**
```bash
# Test HTTPS access
curl -I https://tetrixcorp.com

# Should return: HTTP/1.1 200 OK with SSL headers
```

## 🔧 **Immediate Actions You Can Take**

### **Action 1: Check Current DNS Status**
Let me help you check the current DNS status:

```bash
# Check current nameservers
dig tetrixcorp.com NS +short

# Check A record
dig tetrixcorp.com A +short

# Check from different locations
dig @8.8.8.8 tetrixcorp.com A +short
```

### **Action 2: Test Domain Resolution**
```bash
# Test if domain resolves to your droplet
curl -I http://tetrixcorp.com

# Test droplet directly
curl -I http://207.154.193.187
```

### **Action 3: Prepare SSL Setup**
Once DNS is fixed, we'll run the SSL setup script.

## ⏰ **Expected Timeline**

- **DNS Changes**: 5-15 minutes locally
- **Global Propagation**: 24-48 hours
- **SSL Setup**: 10-15 minutes after DNS resolves
- **Total Time**: 1-2 hours (depending on DNS propagation)

## 🚨 **Troubleshooting**

### **If DNS Still Not Resolving After 1 Hour**
1. **Check registrar settings** - Ensure nameservers are saved
2. **Clear DNS cache** - `sudo systemctl flush-dns` (Linux) or `ipconfig /flushdns` (Windows)
3. **Test from different networks** - Use mobile hotspot or different internet connection
4. **Check TTL settings** - Reduce TTL to 300 seconds for faster updates

### **If SSL Setup Fails**
1. **Verify domain resolution** - `curl -I http://tetrixcorp.com`
2. **Check Nginx logs** - `docker logs miniverxe-nginx-1`
3. **Test Let's Encrypt manually** - `certbot certonly --webroot -w /var/www/certbot -d tetrixcorp.com`

## 📞 **Next Steps**

1. **Update nameservers** at your domain registrar
2. **Wait 15-30 minutes** for local DNS propagation
3. **Test domain resolution** with the commands above
4. **Run SSL setup** once domain resolves
5. **Verify HTTPS access** and SSL configuration

Would you like me to help you check the current DNS status first, or do you want to proceed with updating the nameservers at your domain registrar?
