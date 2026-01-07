# Nginx mTLS Verification Checklist

## Verification Steps

Run these commands on your production server to verify the mTLS setup:

### 1. Verify Nginx Configuration Syntax
```bash
nginx -t
```
**Expected Output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 2. Check Nginx Status
```bash
systemctl status nginx
```
**Expected:** `active (running)`

### 3. Verify Certificate File Exists
```bash
ls -lh /etc/ssl/certs/DigiCert_High_Assurance_EV_Root_CA.pem
```
**Expected:** File should exist and be readable

### 4. Check Webhook Location Block in Config
```bash
grep -A 15 "location /webhooks/whatsapp" /etc/nginx/sites-available/tetrixcorp.com
```
**Expected:** Should show the mTLS configuration block

### 5. Test Webhook Endpoint (Without Meta Certificate)
```bash
curl -v https://tetrixcorp.com/webhooks/whatsapp 2>&1 | grep -E "(HTTP|403|Forbidden)"
```
**Expected:** Should return `403 Forbidden: Invalid Client Certificate` (without Meta's client cert)

### 6. Check Nginx Error Logs
```bash
tail -20 /var/log/nginx/error.log
```
**Expected:** No errors related to SSL or certificate verification

### 7. Verify SSL Client Verification Settings
```bash
grep -E "ssl_verify_client|ssl_client_certificate|ssl_verify_depth" /etc/nginx/sites-available/tetrixcorp.com
```
**Expected:** Should show:
- `ssl_verify_client optional;`
- `ssl_client_certificate /etc/ssl/certs/DigiCert_High_Assurance_EV_Root_CA.pem;`
- `ssl_verify_depth 3;`

### 8. Test with GET Request (Webhook Verification)
```bash
curl "https://tetrixcorp.com/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=test123&hub.verify_token=YOUR_TOKEN"
```
**Expected:** Should return `403` if verify_token doesn't match, or process normally if it matches

---

## Quick Verification Script

Run this complete verification:

```bash
#!/bin/bash
echo "=== Nginx mTLS Verification ==="
echo ""
echo "1. Testing nginx config..."
nginx -t
echo ""
echo "2. Checking nginx status..."
systemctl is-active nginx
echo ""
echo "3. Verifying certificate file..."
ls -lh /etc/ssl/certs/DigiCert_High_Assurance_EV_Root_CA.pem
echo ""
echo "4. Checking webhook location block..."
grep -A 5 "location /webhooks/whatsapp" /etc/nginx/sites-available/tetrixcorp.com | head -10
echo ""
echo "5. Testing endpoint (should return 403)..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://tetrixcorp.com/webhooks/whatsapp
echo ""
echo "6. Checking for SSL directives..."
grep -E "ssl_verify_client|ssl_client_certificate" /etc/nginx/sites-available/tetrixcorp.com
echo ""
echo "=== Verification Complete ==="
```

---

## Expected Results

✅ **Configuration Test:** Should pass without errors  
✅ **Nginx Status:** Should be active and running  
✅ **Certificate:** Should exist at specified path  
✅ **Endpoint Test:** Should return 403 for requests without valid Meta certificate  
✅ **Config Check:** Should show mTLS directives are present  

---

## Troubleshooting

If verification fails:

1. **Config syntax error:** Check the exact line number in nginx -t output
2. **403 not returned:** Verify the `if` block is correctly formatted
3. **Certificate not found:** Re-download the certificate
4. **Nginx won't reload:** Check error logs: `journalctl -u nginx -n 50`

