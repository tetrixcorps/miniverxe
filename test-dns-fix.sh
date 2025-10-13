#!/bin/bash

# DNS Diagnostic Script for poisonedreligion.ai
# Run this script to test DNS resolution after making changes

echo "🔍 DNS Diagnostic Script for poisonedreligion.ai"
echo "================================================"
echo ""

# Function to test DNS resolution
test_dns() {
    local domain=$1
    local type=$2
    
    echo "Testing $type records for $domain:"
    if command -v nslookup &> /dev/null; then
        nslookup -type=$type $domain 2>/dev/null || echo "❌ nslookup failed"
    elif command -v dig &> /dev/null; then
        dig $domain $type 2>/dev/null || echo "❌ dig failed"
    else
        echo "❌ No DNS tools available (nslookup or dig)"
    fi
    echo ""
}

# Function to test HTTP connectivity
test_http() {
    local url=$1
    echo "Testing HTTP connectivity to $url:"
    if command -v curl &> /dev/null; then
        curl -I --connect-timeout 10 "$url" 2>/dev/null && echo "✅ HTTP connection successful" || echo "❌ HTTP connection failed"
    else
        echo "❌ curl not available"
    fi
    echo ""
}

echo "📋 Current Status Check"
echo "======================"

# Test A records
test_dns "poisonedreligion.ai" "A"

# Test NS records
test_dns "poisonedreligion.ai" "NS"

# Test www subdomain
test_dns "www.poisonedreligion.ai" "A"

# Test HTTP connectivity
test_http "http://poisonedreligion.ai"
test_http "https://poisonedreligion.ai"

echo "🔧 Expected Fix Steps"
echo "===================="
echo "1. Delete these NS records from Hurricane Electric DNS:"
echo "   - ns.poisonedreligion.ai → ns3.openprovider.eu"
echo "   - ns.poisonedreligion.ai → ns1.openprovider.nl"
echo "   - ns.poisonedreligion.ai → ns2.openprovider.be"
echo ""
echo "2. Update nameservers at your domain registrar to:"
echo "   - ns1.he.net"
echo "   - ns2.he.net"
echo "   - ns3.he.net"
echo "   - ns4.he.net"
echo "   - ns5.he.net"
echo ""
echo "3. Wait 5-10 minutes and run this script again"
echo ""

echo "✅ Success Indicators"
echo "===================="
echo "When fixed, you should see:"
echo "- A records resolving to 162.159.140.98 and 172.66.0.96"
echo "- NS records showing only Hurricane Electric nameservers"
echo "- HTTP/HTTPS connections working"
echo ""

echo "🔄 Run this script again after making changes to verify the fix"
