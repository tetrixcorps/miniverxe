# 🚀 TETRIX Deployment Guide for DigitalOcean Droplet

## **Quick Start Deployment**

### **Prerequisites**
1. **DigitalOcean Droplet** with Ubuntu 20.04+ or similar
2. **SSH access** to your droplet
3. **Docker and Docker Compose** (will be installed automatically)
4. **Environment variables** (optional, defaults will be used)

### **Step 1: Set Your Droplet IP**
```bash
export DROPLET_IP=your-actual-droplet-ip
export DROPLET_USER=root  # or your username
```

### **Step 2: Run Simple Deployment**
```bash
./deploy-simple.sh
```

### **Step 3: Verify Deployment**
```bash
# Check if application is running
curl http://your-droplet-ip:8080/

# Check health endpoint
curl http://your-droplet-ip:8080/health
```

---

## **What Gets Deployed**

### **✅ Complete TETRIX Application**
- **Main Application** - Astro-based frontend with all recent changes
- **2FA Authentication** - Telnyx Verify API integration
- **Dashboard System** - Healthcare, Construction, Logistics dashboards
- **Phone Number Formatting** - International phone number support
- **API Endpoints** - All authentication and verification endpoints

### **✅ Production Features**
- **Docker Containerization** - Isolated, scalable deployment
- **Nginx Reverse Proxy** - Load balancing and SSL termination
- **Health Checks** - Automatic container health monitoring
- **Auto-restart** - Containers restart automatically on failure
- **Logging** - Centralized application logging

### **✅ Security Features**
- **Environment Variables** - Secure configuration management
- **CORS Protection** - Cross-origin request security
- **Rate Limiting** - API request rate limiting
- **Security Headers** - XSS, CSRF, and clickjacking protection

---

## **Deployment Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Internet      │    │   Nginx Proxy   │    │   TETRIX App    │
│                 │───▶│   (Port 80/443) │───▶│   (Port 8080)   │
│   Users         │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Services Deployed**
1. **tetrix-app** - Main TETRIX application
2. **nginx** - Reverse proxy and load balancer
3. **Data volumes** - Persistent storage for application data

---

## **Environment Configuration**

### **Required Environment Variables**
```bash
# Set your droplet IP
export DROPLET_IP=your-droplet-ip

# Optional: Set custom passwords (defaults will be generated)
export POSTGRES_PASSWORD=your-secure-password
export REDIS_PASSWORD=your-redis-password
export JWT_SECRET=your-jwt-secret
```

### **Optional API Keys (Optional)**
```bash
# Telnyx 2FA (for production 2FA)
export TELNYX_API_KEY=your-telnyx-api-key

# Sinch Chat (for AI chat features)
export SINCH_API_KEY=your-sinch-api-key
export SINCH_API_SECRET=your-sinch-secret

# Mailgun (for email features)
export MAILGUN_API_KEY=your-mailgun-api-key
export MAILGUN_DOMAIN=your-mailgun-domain

# Stripe (for payment features)
export STRIPE_SECRET_KEY=your-stripe-secret-key
export STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

---

## **Post-Deployment Management**

### **Check Application Status**
```bash
ssh root@your-droplet-ip 'cd /opt/tetrix && docker-compose -f docker-compose.simple.yml ps'
```

### **View Application Logs**
```bash
ssh root@your-droplet-ip 'cd /opt/tetrix && docker-compose -f docker-compose.simple.yml logs -f'
```

### **Restart Application**
```bash
ssh root@your-droplet-ip 'cd /opt/tetrix && docker-compose -f docker-compose.simple.yml restart'
```

### **Stop Application**
```bash
ssh root@your-droplet-ip 'cd /opt/tetrix && docker-compose -f docker-compose.simple.yml down'
```

### **Update Application**
```bash
# Re-run the deployment script to update
./deploy-simple.sh
```

---

## **Troubleshooting**

### **Application Not Responding**
```bash
# Check container status
ssh root@your-droplet-ip 'cd /opt/tetrix && docker-compose -f docker-compose.simple.yml ps'

# Check logs for errors
ssh root@your-droplet-ip 'cd /opt/tetrix && docker-compose -f docker-compose.simple.yml logs tetrix-app'

# Restart containers
ssh root@your-droplet-ip 'cd /opt/tetrix && docker-compose -f docker-compose.simple.yml restart'
```

### **Port Already in Use**
```bash
# Check what's using port 8080
ssh root@your-droplet-ip 'netstat -tulpn | grep 8080'

# Kill the process if needed
ssh root@your-droplet-ip 'sudo kill -9 $(lsof -t -i:8080)'
```

### **Docker Issues**
```bash
# Check Docker status
ssh root@your-droplet-ip 'systemctl status docker'

# Restart Docker
ssh root@your-droplet-ip 'systemctl restart docker'
```

---

## **Production Considerations**

### **SSL/HTTPS Setup**
1. **Get SSL Certificate** (Let's Encrypt recommended)
2. **Update Nginx configuration** with SSL settings
3. **Redirect HTTP to HTTPS**

### **Domain Configuration**
1. **Point your domain** to the droplet IP
2. **Update CORS origins** in environment variables
3. **Configure DNS records** as needed

### **Monitoring**
1. **Set up monitoring** (UptimeRobot, Pingdom, etc.)
2. **Configure alerts** for downtime
3. **Monitor resource usage** (CPU, memory, disk)

### **Backups**
1. **Database backups** (if using PostgreSQL)
2. **Application data backups**
3. **Configuration backups**

---

## **Advanced Deployment**

### **Full Production Deployment**
For a complete production setup with PostgreSQL, Redis, and all services:

```bash
# Set additional environment variables
export POSTGRES_PASSWORD=your-secure-postgres-password
export REDIS_PASSWORD=your-secure-redis-password
export JWT_SECRET=your-jwt-secret

# Run full deployment
./deploy-to-droplet.sh
```

### **Custom Configuration**
1. **Edit docker-compose.simple.yml** for custom settings
2. **Modify nginx/nginx.conf** for custom proxy rules
3. **Update .env.production** for custom environment variables

---

## **Deployment Checklist**

### **Pre-Deployment**
- [ ] Droplet IP address configured
- [ ] SSH access to droplet verified
- [ ] Environment variables set (optional)
- [ ] Application code ready

### **Deployment**
- [ ] Run deployment script
- [ ] Verify containers are running
- [ ] Test application endpoints
- [ ] Check health status

### **Post-Deployment**
- [ ] Application accessible via IP
- [ ] Health check responding
- [ ] Logs are being generated
- [ ] No error messages in logs

---

## **Support**

If you encounter issues during deployment:

1. **Check the logs** for error messages
2. **Verify environment variables** are set correctly
3. **Ensure droplet has sufficient resources** (1GB RAM minimum)
4. **Check network connectivity** between your machine and droplet

---

*Deployment Guide Generated: January 22, 2025*  
*TETRIX Version: 2.0*  
*Status: ✅ PRODUCTION READY*
