# SSL Certificate Setup Guide for TETRIX Domain

## 🚨 **Current Issue: DNS Resolution Problem**

The domain `tetrixcorp.com` is **not resolving** to your droplet IP `207.154.193.187`. This is preventing SSL certificate generation.

### **Diagnosis**
- ✅ **Droplet is working**: `http://207.154.193.187` returns 200 OK
- ❌ **Domain not resolving**: `http://tetrixcorp.com` fails to connect
- ❌ **SSL certificate generation fails**: Cannot validate domain ownership

## 🔧 **Solution Steps**

### **Step 1: Verify DNS Configuration**

Check your Hurricane Electric DNS records:

1. **Login to Hurricane Electric**: https://dns.he.net/
2. **Verify A Records**:
   ```
   tetrixcorp.com → 207.154.193.187
   www.tetrixcorp.com → 207.154.193.187
   ```
3. **Check TTL**: Should be 300-3600 seconds for faster propagation

### **Step 2: Test DNS Resolution**

Run these commands to check DNS resolution:

```bash
# Check A record
nslookup tetrixcorp.com
# Should return: 207.154.193.187

# Check from different location
dig tetrixcorp.com A +short
# Should return: 207.154.193.187
```

### **Step 3: Wait for DNS Propagation**

DNS changes can take:
- **Local**: 5-15 minutes
- **Global**: 24-48 hours
- **TTL-based**: Depends on your TTL settings

### **Step 4: Alternative SSL Setup Methods**

#### **Method A: Manual SSL Certificate Upload**

If you have an SSL certificate from another source:

1. **Upload certificate files to droplet**:
   ```bash
   scp -i ~/.ssh/tetrix_droplet_key cert.pem root@207.154.193.187:/etc/ssl/
   scp -i ~/.ssh/tetrix_droplet_key key.pem root@207.154.193.187:/etc/ssl/
   ```

2. **Update Nginx configuration**:
   ```bash
   # Copy SSL files to Nginx container
   docker cp /etc/ssl/cert.pem miniverxe-nginx-1:/etc/nginx/ssl/
   docker cp /etc/ssl/key.pem miniverxe-nginx-1:/etc/nginx/ssl/
   ```

#### **Method B: Self-Signed Certificate (Temporary)**

For testing purposes:

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/tetrixcorp.com.key \
    -out /etc/ssl/certs/tetrixcorp.com.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=tetrixcorp.com"
```

#### **Method C: Use Digital Ocean Load Balancer**

1. **Create Load Balancer**:
   ```bash
   doctl compute load-balancer create \
     --name tetrix-lb \
     --forwarding-rules entry_protocol:http,entry_port:80,target_protocol:http,target_port:80 \
     --forwarding-rules entry_protocol:https,entry_port:443,target_protocol:http,target_port:80 \
     --health-check protocol:http,port:80,path:/health \
     --droplet-ids $(doctl compute droplet list --format ID --no-header | head -1)
   ```

2. **Configure SSL on Load Balancer**:
   - Use Digital Ocean's SSL certificate management
   - Automatic Let's Encrypt integration

## 🎯 **Recommended Immediate Actions**

### **1. Fix DNS Resolution (Priority 1)**

1. **Check Hurricane Electric DNS**:
   - Ensure A records point to `207.154.193.187`
   - Reduce TTL to 300 seconds for faster updates
   - Remove any conflicting CNAME records

2. **Test DNS propagation**:
   ```bash
   # Test from multiple locations
   dig @8.8.8.8 tetrixcorp.com A
   dig @1.1.1.1 tetrixcorp.com A
   ```

### **2. Alternative SSL Setup (Priority 2)**

If DNS is still not working, use a temporary solution:

1. **Create self-signed certificate**:
   ```bash
   ssh -i ~/.ssh/tetrix_droplet_key root@207.154.193.187 "
   mkdir -p /etc/ssl/private /etc/ssl/certs
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout /etc/ssl/private/tetrixcorp.com.key \
     -out /etc/ssl/certs/tetrixcorp.com.crt \
     -subj '/C=US/ST=State/L=City/O=TETRIX/CN=tetrixcorp.com'
   "
   ```

2. **Update Nginx configuration**:
   ```bash
   # Copy certificate to Nginx container
   docker cp /etc/ssl/certs/tetrixcorp.com.crt miniverxe-nginx-1:/etc/nginx/ssl/
   docker cp /etc/ssl/private/tetrixcorp.com.key miniverxe-nginx-1:/etc/nginx/ssl/
   ```

### **3. Update Nginx Configuration**

Create SSL-enabled Nginx configuration:

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name tetrixcorp.com www.tetrixcorp.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name tetrixcorp.com www.tetrixcorp.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/tetrixcorp.com.crt;
        ssl_certificate_key /etc/nginx/ssl/tetrixcorp.com.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        location / {
            proxy_pass http://host.docker.internal:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## 🔍 **Troubleshooting Commands**

### **Check DNS Resolution**
```bash
# Test domain resolution
nslookup tetrixcorp.com
dig tetrixcorp.com A +short

# Test from different DNS servers
dig @8.8.8.8 tetrixcorp.com A
dig @1.1.1.1 tetrixcorp.com A
```

### **Check Droplet Status**
```bash
# Test droplet directly
curl -I http://207.154.193.187

# Check Docker containers
ssh -i ~/.ssh/tetrix_droplet_key root@207.154.193.187 "docker ps"
```

### **Check Nginx Logs**
```bash
# Check Nginx container logs
ssh -i ~/.ssh/tetrix_droplet_key root@207.154.193.187 "docker logs miniverxe-nginx-1"
```

## 📋 **Next Steps**

1. **Fix DNS resolution** in Hurricane Electric
2. **Wait for propagation** (up to 48 hours)
3. **Test domain accessibility** with `curl -I http://tetrixcorp.com`
4. **Run SSL setup script** once domain resolves
5. **Verify HTTPS access** with `curl -I https://tetrixcorp.com`

## 🎯 **Expected Results**

After successful setup:
- ✅ `http://tetrixcorp.com` → Redirects to HTTPS
- ✅ `https://tetrixcorp.com` → Returns 200 OK
- ✅ SSL certificate valid and trusted
- ✅ Security headers properly configured

The main issue is DNS resolution. Once the domain properly points to your droplet, SSL certificate generation will work automatically.
