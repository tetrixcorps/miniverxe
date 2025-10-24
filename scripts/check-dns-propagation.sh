#!/bin/bash

# DNS Propagation Checker
# This script checks if DNS records have propagated globally

DOMAIN="tetrixcorp.com"
WWW_DOMAIN="www.tetrixcorp.com"
EXPECTED_IP="207.154.193.187"

echo "🔍 DNS Propagation Checker"
echo "=========================="
echo "Domain: $DOMAIN"
echo "WWW Domain: $WWW_DOMAIN"
echo "Expected IP: $EXPECTED_IP"
echo "Timestamp: $(date)"
echo ""

echo "📋 Checking DNS propagation using multiple DNS servers..."
echo ""

# Function to check DNS resolution
check_dns() {
    local domain=$1
    local dns_server=$2
    local server_name=$3
    
    echo "Checking $domain via $server_name ($dns_server):"
    result=$(timeout 10 nslookup $domain $dns_server 2>/dev/null | grep -A1 "Name:" | tail -1 | awk '{print $2}' || echo "timeout")
    if [ "$result" = "$EXPECTED_IP" ]; then
        echo "  ✅ $domain -> $result (CORRECT)"
    elif [ "$result" = "timeout" ]; then
        echo "  ⏳ $domain -> timeout (checking...)"
    else
        echo "  ❌ $domain -> $result (expected: $EXPECTED_IP)"
    fi
    echo ""
}

# Check main domain
check_dns $DOMAIN "8.8.8.8" "Google DNS"
check_dns $DOMAIN "1.1.1.1" "Cloudflare DNS"
check_dns $DOMAIN "208.67.222.222" "OpenDNS"

# Check www subdomain
check_dns $WWW_DOMAIN "8.8.8.8" "Google DNS"
check_dns $WWW_DOMAIN "1.1.1.1" "Cloudflare DNS"
check_dns $WWW_DOMAIN "208.67.222.222" "OpenDNS"

echo "📋 Testing HTTP access..."
echo "tetrixcorp.com:"
curl -s -I http://$DOMAIN | head -1 || echo "Failed to connect"

echo "www.tetrixcorp.com:"
curl -s -I http://$WWW_DOMAIN | head -1 || echo "Failed to connect"

echo ""
echo "🎯 DNS Propagation Status:"
echo "========================="
echo "If all checks show the correct IP ($EXPECTED_IP), DNS has propagated."
echo "If some show different results, wait 5-10 minutes and run this script again."
echo ""
echo "Once DNS is fully propagated, you can run the SSL setup script."
