# Immediate Fix for 502 Bad Gateway

Based on your server output, here are the immediate steps to fix the 502 error:

## 🔍 Issues Identified

1. **TETRIX directory not found at `/opt/tetrix`** - Application is likely in a different location
2. **Redis port conflict** - Port 6379 is already used by `voip_redis` container
3. **TETRIX containers not running** - Containers need to be started
4. **Nginx not installed** - Nginx needs to be installed and configured

## 🚀 Quick Fix Steps

### Step 1: Find TETRIX Directory

```bash
# Search for docker-compose.yml
find ~ -name "docker-compose.yml" -type f 2>/dev/null | grep -i tetrix

# Or check common locations
ls -la /root/tetrix
ls -la ~/tetrix
ls -la ~/Desktop/tetrix
```

### Step 2: Fix Redis Port Conflict

The `voip_redis` container is using port 6379. Update `docker-compose.yml`:

```bash
cd /path/to/tetrix  # Use the directory found in Step 1

# Edit docker-compose.yml
nano docker-compose.yml

# Find this line:
#   - "6379:6379"
# Change to:
#   - "6381:6379"
```

Or use sed:
```bash
sed -i 's/6379:6379/6381:6379/g' docker-compose.yml
```

### Step 3: Start TETRIX Containers

```bash
cd /path/to/tetrix

# Stop any existing containers
docker-compose down

# Start containers
docker-compose up -d

# Check status
docker-compose ps
```

### Step 4: Verify Application is Running

```bash
# Wait a moment for containers to start
sleep 30

# Test the application
curl http://localhost:8082/health
curl http://localhost:8082

# Check container logs if not working
docker-compose logs tetrix-frontend
docker-compose logs tetrix-backend
```

### Step 5: Install and Configure Nginx

```bash
# Install nginx
sudo apt update
sudo apt install -y nginx

# Create nginx configuration
sudo nano /etc/nginx/sites-available/tetrixcorp.com
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name tetrixcorp.com www.tetrixcorp.com;

    location / {
        proxy_pass http://localhost:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and test:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## 🔧 Automated Fix Script

Upload and run the quick fix script:

```bash
# On your local machine
scp -i ~/.ssh/tetrix_droplet_key scripts/quick-fix-502.sh root@207.154.193.187:/tmp/

# On the server
chmod +x /tmp/quick-fix-502.sh
/tmp/quick-fix-502.sh
```

## 📋 Manual Commands Summary

```bash
# 1. Find TETRIX directory
cd ~/Desktop/tetrix  # or wherever it is

# 2. Fix Redis port
sed -i 's/6379:6379/6381:6379/g' docker-compose.yml

# 3. Start containers
docker-compose down
docker-compose up -d

# 4. Wait and test
sleep 30
curl http://localhost:8082/health

# 5. Install nginx (if needed)
sudo apt update && sudo apt install -y nginx

# 6. Create nginx config (see Step 5 above)
# 7. Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

## ✅ Verification

After completing the steps:

1. **Check containers are running:**
   ```bash
   docker ps | grep tetrix
   ```

2. **Test application directly:**
   ```bash
   curl http://localhost:8082
   ```

3. **Test through nginx:**
   ```bash
   curl http://localhost
   ```

4. **Check nginx error logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

## 🐛 Troubleshooting

### Containers won't start
```bash
# Check logs
docker-compose logs

# Check for port conflicts
ss -tlnp | grep -E ":(8082|3001|6381)"
```

### Application not responding
```bash
# Check container logs
docker-compose logs tetrix-frontend
docker-compose logs tetrix-backend

# Check if containers are healthy
docker ps
docker inspect tetrix-frontend | grep -A 10 Health
```

### Nginx still showing 502
```bash
# Check nginx error log
sudo tail -50 /var/log/nginx/error.log

# Verify upstream is correct
sudo grep -A 2 "proxy_pass" /etc/nginx/sites-available/tetrixcorp.com

# Test upstream connectivity
curl -v http://localhost:8082
```

---

**Most Important:** Make sure you're in the correct TETRIX directory and the Redis port is changed from 6379 to 6381!

