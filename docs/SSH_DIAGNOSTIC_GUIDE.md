# SSH Diagnostic Guide for 502 Bad Gateway

## 🔍 Problem
SSH connection to the droplet is being refused, but we need to diagnose the 502 Bad Gateway error.

## 🚀 Solutions

### Option 1: Use DigitalOcean Console (Recommended)

1. **Log into DigitalOcean Dashboard**
   - Go to https://cloud.digitalocean.com
   - Navigate to Droplets → Select your droplet (207.154.193.187)

2. **Access Console**
   - Click on your droplet
   - Click "Access" → "Launch Droplet Console"
   - Or use the "Console" button in the droplet view

3. **Run Diagnostic Script**
   ```bash
   # Upload the script first (or create it manually)
   # Then run:
   chmod +x comprehensive-diagnostic.sh
   ./comprehensive-diagnostic.sh
   ```

### Option 2: Fix SSH Connection

If SSH is being refused, try these:

```bash
# 1. Check SSH key permissions
chmod 600 ~/.ssh/tetrix_droplet_key

# 2. Try with verbose output to see the error
ssh -v -i ~/.ssh/tetrix_droplet_key root@207.154.193.187

# 3. Check if SSH is on a different port
ssh -p 2222 -i ~/.ssh/tetrix_droplet_key root@207.154.193.187

# 4. Check firewall rules (if you have access)
# The droplet might have firewall blocking SSH
```

### Option 3: Upload Script via SCP (if file transfer works)

```bash
# From your local machine
scp -i ~/.ssh/tetrix_droplet_key \
    scripts/comprehensive-diagnostic.sh \
    root@207.154.193.187:/tmp/

# Then access via console and run:
chmod +x /tmp/comprehensive-diagnostic.sh
/tmp/comprehensive-diagnostic.sh
```

## 📋 Manual Diagnostic Steps

If you can't run the script, follow these steps manually:

### Step 1: Find TETRIX Directory

```bash
# Try common locations
cd /opt/tetrix
cd ~/Desktop/tetrix
cd ~/tetrix
cd /root/tetrix

# Or search for it
find ~ -name "docker-compose.yml" -type f 2>/dev/null | grep tetrix
```

### Step 2: Check Docker Containers

```bash
# Check if TETRIX containers are running
docker ps -a | grep tetrix

# Check all containers
docker ps

# If containers are stopped, start them
cd /path/to/tetrix  # Use directory from Step 1
docker-compose up -d
```

### Step 3: Check Port Conflicts

```bash
# Check what's using critical ports
ss -tlnp | grep -E ':(80|443|8080|8082|3001|6379)'

# If port 6379 is in use (Redis conflict), fix it:
cd /path/to/tetrix
sed -i 's/6379:6379/6381:6379/g' docker-compose.yml
docker-compose down
docker-compose up -d
```

### Step 4: Test Application

```bash
# Test if application is running
curl http://localhost:8082/health
curl http://localhost:8082

# Check container logs if not working
docker-compose logs tetrix-frontend
docker-compose logs tetrix-backend
```

### Step 5: Check Nginx

```bash
# Check if nginx is installed
which nginx
systemctl status nginx

# If not installed
sudo apt update
sudo apt install -y nginx

# Check nginx config
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/

# Check nginx error logs
tail -50 /var/log/nginx/error.log
```

### Step 6: Configure Nginx

If nginx is installed but not configured:

```bash
# Create nginx config
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
sudo ln -s /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 Quick Fix Commands

Once you have access, run these in order:

```bash
# 1. Find and navigate to TETRIX directory
cd ~/Desktop/tetrix  # or wherever it is

# 2. Fix Redis port conflict
sed -i 's/6379:6379/6381:6379/g' docker-compose.yml

# 3. Start containers
docker-compose down
docker-compose up -d

# 4. Wait for startup
sleep 30

# 5. Test application
curl http://localhost:8082/health

# 6. Install nginx if needed
sudo apt update && sudo apt install -y nginx

# 7. Create nginx config (see Step 6 above)
# 8. Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

## 📊 Expected Results

After running the diagnostic:

- ✅ **Containers Running**: `docker ps` should show `tetrix-frontend` and `tetrix-backend`
- ✅ **Application Responding**: `curl http://localhost:8082` should return HTML
- ✅ **Nginx Running**: `systemctl status nginx` should show "active (running)"
- ✅ **No Port Conflicts**: Port 6379 should not conflict with TETRIX Redis

## 🐛 Common Issues

### Issue: Can't find TETRIX directory
**Solution**: The application might be in a different location. Use `find` to search.

### Issue: Containers won't start
**Solution**: Check logs with `docker-compose logs` and fix any errors.

### Issue: Port 6379 conflict
**Solution**: Already fixed in `docker-compose.yml` - change to 6381.

### Issue: Nginx not installed
**Solution**: Install with `sudo apt install -y nginx`.

### Issue: Nginx config errors
**Solution**: Run `sudo nginx -t` to see errors, then fix them.

---

**Next Steps**: Once you have console access, run the comprehensive diagnostic script to get a full report of all issues.

