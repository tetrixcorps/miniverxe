# Manual SSL Setup Guide for TETRIX

## 🎯 **Current Status**
- ✅ **DNS Resolution**: tetrixcorp.com is resolving to 207.154.193.187
- ✅ **HTTP Access**: Domain is accessible via HTTP
- ✅ **Docker Services**: All containers are running
- ❌ **HTTPS Access**: SSL certificates not configured yet

## 🔧 **Manual SSL Setup Steps**

### **Step 1: Connect to Your Droplet**

Since SSH is having issues, use the **Digital Ocean Console**:

1. **Login to Digital Ocean**: https://cloud.digitalocean.com/
2. **Go to Droplets** → Select your droplet
3. **Click "Console"** to access the web-based terminal

### **Step 2: Install Certbot**

```bash
# Update system packages
apt update

# Install Certbot
apt install -y certbot
```

### **Step 3: Create Webroot Directory**

```bash
# Create webroot directory for ACME challenges
mkdir -p /var/www/certbot
```

### **Step 4: Create Temporary Nginx Configuration**

```bash
# Create a temporary Nginx configuration for SSL challenges
cat > /tmp/nginx-ssl-challenge.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name tetrixcorp.com www.tetrixcorp.com;
        
        # Serve ACME challenge files
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files $uri =404;
        }
        
        # Proxy everything else to the app
        location / {
            proxy_pass http://host.docker.internal:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
```

### **Step 5: Stop Current Nginx and Start Challenge Nginx**

```bash
# Stop the current Nginx container
docker stop miniverxe-nginx-1

# Start a new Nginx container for SSL challenges
docker run -d --name nginx-ssl-challenge \
    -p 80:80 \
    -v /tmp/nginx-ssl-challenge.conf:/etc/nginx/nginx.conf \
    -v /var/www/certbot:/var/www/certbot \
    nginx:alpine

# Wait for Nginx to start
sleep 10
```

### **Step 6: Test Webroot Accessibility**

```bash
# Create a test file
echo "test" > /var/www/certbot/test.txt

# Test if webroot is accessible
curl http://tetrixcorp.com/.well-known/acme-challenge/test.txt
# Should return: test
```

### **Step 7: Obtain SSL Certificate**

```bash
# Get SSL certificate from Let's Encrypt
certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@tetrixcorp.com \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    -d tetrixcorp.com
```

### **Step 8: Stop Challenge Nginx and Start Main Nginx**

```bash
# Stop challenge Nginx container
docker stop nginx-ssl-challenge
docker rm nginx-ssl-challenge

# Create SSL directory in main Nginx container
docker exec miniverxe-nginx-1 mkdir -p /etc/nginx/ssl

# Copy SSL certificates to Nginx container
docker cp /etc/letsencrypt/live/tetrixcorp.com/fullchain.pem miniverxe-nginx-1:/etc/nginx/ssl/cert.pem
docker cp /etc/letsencrypt/live/tetrixcorp.com/privkey.pem miniverxe-nginx-1:/etc/nginx/ssl/key.pem

# Start main Nginx container
docker start miniverxe-nginx-1

# Wait for Nginx to start
sleep 15
```

### **Step 9: Set Up Automatic Renewal**

```bash
# Add renewal cron job
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker restart miniverxe-nginx-1") | crontab -
```

### **Step 10: Test SSL Certificate**

```bash
# Test HTTPS access
curl -I https://tetrixcorp.com

# Should return: HTTP/1.1 200 OK with SSL headers
```

## 🎯 **Expected Results**

After successful setup:

### **HTTP Redirect**
```bash
curl -I http://tetrixcorp.com
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://tetrixcorp.com/
```

### **HTTPS Access**
```bash
curl -I https://tetrixcorp.com
# Should return: HTTP/1.1 200 OK
# With SSL headers and security headers
```

### **Browser Access**
- **http://tetrixcorp.com** → Automatically redirects to HTTPS
- **https://tetrixcorp.com** → Shows secure padlock icon

## 🔍 **Troubleshooting**

### **If Certificate Generation Fails**

1. **Check domain resolution**:
   ```bash
   curl -I http://tetrixcorp.com
   ```

2. **Check webroot accessibility**:
   ```bash
   curl http://tetrixcorp.com/.well-known/acme-challenge/test.txt
   ```

3. **Check Nginx logs**:
   ```bash
   docker logs nginx-ssl-challenge
   ```

### **If HTTPS Doesn't Work After Setup**

1. **Check SSL certificates exist**:
   ```bash
   docker exec miniverxe-nginx-1 ls -la /etc/nginx/ssl/
   ```

2. **Check Nginx configuration**:
   ```bash
   docker exec miniverxe-nginx-1 nginx -t
   ```

3. **Restart Nginx container**:
   ```bash
   docker restart miniverxe-nginx-1
   ```

## 📋 **Verification Checklist**

- [ ] Domain resolves to droplet IP
- [ ] HTTP access works
- [ ] SSL certificate generated successfully
- [ ] HTTPS access works
- [ ] HTTP redirects to HTTPS
- [ ] Automatic renewal configured
- [ ] Security headers present

## 🎉 **Success Indicators**

- ✅ **https://tetrixcorp.com** loads with green padlock
- ✅ **http://tetrixcorp.com** redirects to HTTPS
- ✅ SSL certificate is valid and trusted
- ✅ Security headers are present
- ✅ Automatic renewal is configured

Your TETRIX application will then be fully accessible via HTTPS with proper SSL security!
