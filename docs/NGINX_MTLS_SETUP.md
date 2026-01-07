# Nginx mTLS Configuration for WhatsApp Webhooks

## Overview
This document outlines the changes made to the Nginx configuration to support Mutual TLS (mTLS) for WhatsApp Webhooks, enhancing security by verifying Meta's client certificate.

## Implementation Details

### 1. New Location Block
A dedicated location block `/webhooks/whatsapp` has been added to `nginx/nginx.conf`. This block handles requests specifically for WhatsApp webhooks.

### 2. Configuration Changes
The following configuration has been added (currently commented out pending certificate download):

```nginx
# WhatsApp Webhooks (mTLS)
location /webhooks/whatsapp {
    # Enable mTLS verification
    # ssl_verify_client optional;
    # ssl_client_certificate /etc/ssl/certs/DigiCert_High_Assurance_EV_Root_CA.pem;
    # ssl_verify_depth 3;

    # Verify Common Name
    # if ($ssl_client_s_dn !~ "CN=client.webhooks.fbclientcerts.com") {
    #     return 403 "Forbidden: Invalid Client Certificate";
    # }

    proxy_pass http://tetrix_app;
    # ... standard proxy headers ...
}
```

## Setup Instructions

To fully enable mTLS, follow these steps on your production server:

1.  **Download the Root CA Certificate**:
    Download the DigiCert High Assurance EV Root CA certificate to your server:
    ```bash
    wget https://dl.cacerts.digicert.com/DigiCertHighAssuranceEVRootCA.crt.pem -O /etc/ssl/certs/DigiCert_High_Assurance_EV_Root_CA.pem
    ```

2.  **Update Nginx Configuration**:
    - Uncomment the `ssl_verify_client`, `ssl_client_certificate`, and `ssl_verify_depth` directives.
    - Uncomment the `if` block to enable CN verification.
    - **Note**: `ssl_verify_client` should be set to `optional` or configured in a way that doesn't break other parts of your site if they don't use client certificates. Since this is inside a `server` block, it applies to the whole server. If you only want it for this location, you might need a separate server block or rely on `optional` + the `if` check in the location block.

3.  **Reload Nginx**:
    ```bash
    nginx -t
    systemctl reload nginx
    ```

## Verification

After enabling, you can verify the setup by ensuring that requests to `https://tetrixcorp.com/webhooks/whatsapp` are rejected (403 Forbidden) if they don't provide a valid client certificate with the CN `client.webhooks.fbclientcerts.com`.

## References
- [Meta Graph API Webhooks - mTLS](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/#mtls-for-webhooks)
- [Nginx SSL Module Documentation](http://nginx.org/en/docs/http/ngx_http_ssl_module.html)

