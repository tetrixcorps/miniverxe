# Nginx mTLS Setup - Split Terminal Commands

## Overview
This guide provides commands to run in split terminals to complete the mTLS setup for WhatsApp webhooks.

## Prerequisites
✅ Certificate already downloaded: `/etc/ssl/certs/DigiCert_High_Assurance_EV_Root_CA.pem`

---

## Terminal 1: Server Configuration (SSH Session)

### Step 1: SSH to Production Server
```bash
ssh -i ~/.ssh/tetrix_droplet_key root@207.154.193.187
cd /opt/tetrix
```

### Step 2: Backup Current Config
```bash
cp /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-available/tetrixcorp.com.backup.$(date +%Y%m%d_%H%M%S)
```

### Step 3: Edit Nginx Config
```bash
nano /etc/nginx/sites-available/tetrixcorp.com
```

**In Nano Editor:**
1. Find the `location /auth/` block (around line 134)
2. **After** the closing `}` of `/auth/` location, add the following:

```nginx
        # WhatsApp Webhooks (mTLS)
        location /webhooks/whatsapp {
            # Enable mTLS verification
            ssl_verify_client optional;
            ssl_client_certificate /etc/ssl/certs/DigiCert_High_Assurance_EV_Root_CA.pem;
            ssl_verify_depth 3;

            # Verify the Common Name (CN) matches Meta's certificate
            if ($ssl_client_s_dn !~ "CN=client.webhooks.fbclientcerts.com") {
                return 403 "Forbidden: Invalid Client Certificate";
            }

            proxy_pass http://tetrix_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
```

3. Save: `Ctrl+X`, then `Y`, then `Enter`

---

## Terminal 2: Test and Reload Nginx

### Step 1: Test Configuration Syntax
```bash
nginx -t
```

**Expected Output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 2: Reload Nginx (if test passes)
```bash
systemctl reload nginx
```

### Step 3: Verify Nginx Status
```bash
systemctl status nginx
```

**Expected:** `active (running)`

---

## Terminal 1: Verification (Back in SSH Session)

### Verify Certificate File Exists
```bash
ls -lh /etc/ssl/certs/DigiCert_High_Assurance_EV_Root_CA.pem
```

### Test Webhook Endpoint (Should return 403 without valid cert)
```bash
curl -v https://tetrixcorp.com/webhooks/whatsapp
```

**Expected:** `403 Forbidden: Invalid Client Certificate` (without Meta's client cert)

### Check Nginx Error Logs (if issues)
```bash
tail -f /var/log/nginx/error.log
```

---

## Alternative: Copy Config from Repository

If you prefer to copy the entire config from the repository:

### Terminal 1: Copy Updated Config
```bash
# On your local machine (not SSH'd)
scp -i ~/.ssh/tetrix_droplet_key nginx/nginx.conf root@207.154.193.187:/tmp/nginx.conf.new

# Then SSH and merge the webhooks section
ssh -i ~/.ssh/tetrix_droplet_key root@207.154.193.187
```

### Terminal 2: Merge Config Sections
```bash
# Extract just the webhooks location block
grep -A 20 "# WhatsApp Webhooks" /tmp/nginx.conf.new

# Manually add to /etc/nginx/sites-available/tetrixcorp.com
nano /etc/nginx/sites-available/tetrixcorp.com
```

---

## Quick Reference Commands

**All in one sequence (Terminal 1):**
```bash
ssh -i ~/.ssh/tetrix_droplet_key root@207.154.193.187
cp /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-available/tetrixcorp.com.backup.$(date +%Y%m%d_%H%M%S)
nano /etc/nginx/sites-available/tetrixcorp.com
# Add webhooks location block, save
nginx -t && systemctl reload nginx
```

**All in one sequence (Terminal 2 - Verification):**
```bash
curl -v https://tetrixcorp.com/webhooks/whatsapp
systemctl status nginx
tail -20 /var/log/nginx/error.log
```

---

## Troubleshooting

### If `nginx -t` fails:
```bash
# Check syntax errors
nginx -t 2>&1 | grep -i error

# View full config
cat /etc/nginx/sites-available/tetrixcorp.com | grep -A 20 "webhooks/whatsapp"
```

### If reload fails:
```bash
# Check nginx status
systemctl status nginx

# View recent errors
journalctl -u nginx -n 50 --no-pager
```

### If certificate not found:
```bash
# Verify certificate exists
ls -lh /etc/ssl/certs/DigiCert_High_Assurance_EV_Root_CA.pem

# Re-download if needed
wget https://dl.cacerts.digicert.com/DigiCertHighAssuranceEVRootCA.crt.pem -O /etc/ssl/certs/DigiCert_High_Assurance_EV_Root_CA.pem
```

