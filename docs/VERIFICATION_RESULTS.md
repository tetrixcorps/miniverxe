# Verification Results & Next Steps

## Current Status

**Endpoint Response:** `302 Redirect` (instead of expected `403 Forbidden`)

This indicates the webhook endpoint is accessible but may be:
1. Redirecting to another location
2. The mTLS configuration may need adjustment
3. The location block might not be matching correctly

## Verification Commands to Run on Server

Please run these commands **on your production server** (via SSH) to verify the configuration:

### 1. Check if Webhook Location Block Exists
```bash
grep -A 15 "location /webhooks/whatsapp" /etc/nginx/sites-available/tetrixcorp.com
```

### 2. Verify mTLS Directives Are Present
```bash
grep -E "ssl_verify_client|ssl_client_certificate|ssl_verify_depth" /etc/nginx/sites-available/tetrixcorp.com | grep -v "^#"
```

### 3. Test Nginx Configuration
```bash
nginx -t
```

### 4. Check Nginx Error Logs
```bash
tail -30 /var/log/nginx/error.log | grep -i "webhook\|ssl\|certificate"
```

### 5. Verify Certificate File
```bash
ls -lh /etc/ssl/certs/DigiCert_High_Assurance_EV_Root_CA.pem
```

## Expected Configuration

The location block should look like this:

```nginx
location /webhooks/whatsapp {
    ssl_verify_client optional;
    ssl_client_certificate /etc/ssl/certs/DigiCert_High_Assurance_EV_Root_CA.pem;
    ssl_verify_depth 3;

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

## Important Notes

1. **mTLS directives are server-level**: The `ssl_verify_client`, `ssl_client_certificate`, and `ssl_verify_depth` directives typically need to be in the `server` block, not just the `location` block. However, using `optional` allows other locations to work without client certificates.

2. **The `if` block handles the verification**: Even with `ssl_verify_client optional`, the `if` statement checks the CN and returns 403 if it doesn't match.

3. **302 response**: If you're getting a 302, it might be:
   - The application is redirecting (check your app routing)
   - The location block isn't matching (check for trailing slashes)
   - A default redirect rule is catching it first

## Next Steps

1. **Run the verification commands above** on your server
2. **Share the output** so we can diagnose the issue
3. **Check if the location block is being matched** by reviewing nginx access logs:
   ```bash
   tail -f /var/log/nginx/access.log | grep webhooks
   ```

The 302 response suggests the request is reaching your application, which is good. We just need to ensure the mTLS verification is working correctly.

