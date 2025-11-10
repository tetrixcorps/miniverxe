# Manual Nginx API Routing Fix

## Problem
The `/api` location block is at line 5, which is **outside** the server block. Nginx location blocks must be **inside** a server block to work.

## Solution

### Step 1: SSH to Droplet
```bash
ssh -i ~/.ssh/tetrix_droplet_key root@207.154.193.187
cd /opt/tetrix
```

### Step 2: Backup Config
```bash
cp /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-available/tetrixcorp.com.backup
```

### Step 3: Edit Config
```bash
nano /etc/nginx/sites-available/tetrixcorp.com
```

### Step 4: Fix the Structure

**Current (WRONG):**
```
location /api {          # Line 5 - OUTSIDE server block ❌
    ...
}

server {                 # Line 19 - Server block starts here
    ...
    location / {         # Line 24
        ...
    }
}
```

**Should be (CORRECT):**
```
server {                 # Server block starts
    ...
    location /api {      # INSIDE server block, BEFORE location / ✅
        proxy_pass http://localhost:8082;
        ...
    }
    
    location / {        # AFTER /api location block
        ...
    }
}
```

### Step 5: In Nano Editor

1. Find the server block (search for `server {`)
2. Find `location /` inside that server block
3. **BEFORE** `location /`, add:
```nginx
        location /api {
            proxy_pass http://localhost:8082;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }
```

4. **DELETE** the `/api` location block at the top (line 5)
5. Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 6: Test and Reload
```bash
nginx -t
systemctl reload nginx
```

### Step 7: Verify
```bash
curl https://tetrixcorp.com/api/v2/auth/countries
```

Expected: JSON response with countries list, not HTML error page.

