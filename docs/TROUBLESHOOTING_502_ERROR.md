# Troubleshooting 502 Bad Gateway Error

## 🔍 Problem
The website shows `502 Bad Gateway nginx/1.18.0 (Ubuntu)`, which means nginx is running but cannot connect to the backend application.

## 🎯 Root Causes

### 1. **Application Not Running**
The most common cause - the application container/process is not running.

### 2. **Port/Container Name Mismatch**
Nginx config references `tetrix-app:8080` but Docker uses `tetrix-frontend`.

### 3. **Docker Containers Stopped**
Containers may have crashed or stopped.

### 4. **Network Issues**
Docker network configuration problems.

## 🛠️ Solution Steps

### Step 1: SSH to the Server

If SSH is being refused, try:
```bash
# Check if SSH key permissions are correct
chmod 600 ~/.ssh/tetrix_droplet_key

# Try connecting with verbose output
ssh -v -i ~/.ssh/tetrix_droplet_key root@207.154.193.187

# If still failing, check if SSH is on a different port
ssh -p 2222 -i ~/.ssh/tetrix_droplet_key root@207.154.193.187
```

### Step 2: Run Diagnostic Script

Once connected:
```bash
cd /opt/tetrix
./scripts/diagnose-502-error.sh
```

Or upload and run:
```bash
# On your local machine, copy the script
scp -i ~/.ssh/tetrix_droplet_key scripts/diagnose-502-error.sh root@207.154.193.187:/opt/tetrix/
scp -i ~/.ssh/tetrix_droplet_key scripts/fix-502-bad-gateway.sh root@207.154.193.187:/opt/tetrix/

# On the server
cd /opt/tetrix
chmod +x scripts/*.sh
./scripts/diagnose-502-error.sh
```

### Step 3: Check Docker Containers

```bash
cd /opt/tetrix

# Check container status
docker ps -a

# Check if containers are running
docker ps | grep tetrix

# If containers are stopped, start them
docker-compose up -d
# or
docker compose up -d

# Check container logs
docker logs tetrix-frontend --tail 50
docker logs tetrix-backend --tail 50
```

### Step 4: Fix Nginx Configuration

The nginx config may reference `tetrix-app:8080` but Docker uses `tetrix-frontend`.

**Option A: Update nginx to use host port mapping**
```bash
# Edit nginx config
nano /etc/nginx/sites-available/tetrixcorp.com
# or
nano /etc/nginx/sites-enabled/default

# Change upstream from:
#   server tetrix-app:8080;
# To:
#   server localhost:8082;  # or 127.0.0.1:8082

# Test and reload
nginx -t
systemctl reload nginx
```

**Option B: Use Docker network names**
```bash
# Ensure containers are on the same Docker network
docker network ls
docker network inspect tetrix-network

# Update nginx upstream to match actual container name
# Change: tetrix-app:8080
# To: tetrix-frontend:8080 (if using Docker networking)
```

### Step 5: Verify Application is Running

```bash
# Test if application responds
curl http://localhost:8082/health
curl http://localhost:8080/health

# Check what's listening
ss -tlnp | grep -E ":(8080|8082|3001)"
# or
netstat -tlnp | grep -E ":(8080|8082|3001)"
```

### Step 6: Check Application Logs

```bash
# Docker logs
docker logs tetrix-frontend --tail 100 -f
docker logs tetrix-backend --tail 100 -f

# Application logs (if not using Docker)
cd /opt/tetrix
tail -f logs/*.log
```

### Step 7: Restart Services

```bash
# Restart Docker containers
cd /opt/tetrix
docker-compose restart

# Or restart nginx
systemctl restart nginx

# Or restart everything
docker-compose down && docker-compose up -d
systemctl restart nginx
```

## 🔧 Quick Fix Script

Run the automated fix script:
```bash
cd /opt/tetrix
./scripts/fix-502-bad-gateway.sh
```

## 📋 Common Issues & Solutions

### Issue: Containers keep stopping
**Solution:**
```bash
# Check container exit codes
docker ps -a

# Check logs for errors
docker logs tetrix-frontend
docker logs tetrix-backend

# Check if database is running
docker ps | grep tetrix-db

# Check environment variables
docker exec tetrix-frontend env | grep -E "(PORT|HOST|DATABASE)"
```

### Issue: Port already in use
**Solution:**
```bash
# Find what's using the port
lsof -i :8082
lsof -i :8080
lsof -i :3001

# Kill the process or change port in docker-compose.yml
```

### Issue: Database connection failed
**Solution:**
```bash
# Check database container
docker ps | grep tetrix-db

# Check database connection string
docker exec tetrix-backend env | grep DATABASE_URL

# Test database connection
docker exec -it tetrix-db psql -U tetrix_user -d tetrix_auth -c "SELECT 1;"
```

### Issue: Nginx can't resolve container names
**Solution:**
```bash
# If nginx is running outside Docker, use localhost:PORT
# If nginx is in Docker, ensure it's on the same network

# Check Docker networks
docker network ls
docker network inspect bridge

# Connect nginx container to app network (if nginx is in Docker)
docker network connect tetrix-network nginx-container
```

## 🔍 Diagnostic Commands

```bash
# Full system check
systemctl status nginx
systemctl status docker
docker ps -a
docker network ls
ss -tlnp | grep -E ":(80|443|8080|8082|3001)"
tail -50 /var/log/nginx/error.log
journalctl -u nginx -n 50
```

## 📞 Still Having Issues?

1. **Check nginx error logs:**
   ```bash
   tail -f /var/log/nginx/error.log
   ```

2. **Check application startup:**
   ```bash
   docker-compose logs -f
   ```

3. **Verify environment:**
   ```bash
   cd /opt/tetrix
   cat docker.env | grep -v PASSWORD
   ```

4. **Test connectivity manually:**
   ```bash
   # From server
   curl -v http://localhost:8082
   curl -v http://localhost:3001/health
   
   # From outside (if firewall allows)
   curl -v http://207.154.193.187:8082
   ```

## ✅ Verification Checklist

- [ ] Docker containers are running (`docker ps`)
- [ ] Application responds on port 8082 (`curl http://localhost:8082`)
- [ ] Nginx config is valid (`nginx -t`)
- [ ] Nginx can reach application (check error logs)
- [ ] Database is running (`docker ps | grep db`)
- [ ] No port conflicts (`ss -tlnp`)
- [ ] Environment variables are set correctly
- [ ] Application logs show no errors

---

**Last Updated:** 2024
**Related Files:**
- `scripts/diagnose-502-error.sh` - Diagnostic script
- `scripts/fix-502-bad-gateway.sh` - Automated fix script
- `nginx/nginx.conf` - Nginx configuration
- `docker-compose.yml` - Docker container configuration

