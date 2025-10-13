#!/bin/bash

# TETRIX Domain Configuration Script
# This script helps configure and monitor domain settings

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Domain configuration
MAIN_DOMAIN="tetrixcorp.com"
JOROMI_DOMAIN="joromi.ai"
DIGITALOCEAN_APP_ID="ca96485c-ee6b-401b-b1a2-8442c3bc7f04"

# Subdomains to configure
SUBDOMAINS=(
    "www.tetrixcorp.com"
    "api.tetrixcorp.com"
    "iot.tetrixcorp.com"
    "vpn.tetrixcorp.com"
    "www.joromi.ai"
)

echo -e "${BLUE}🌐 TETRIX Domain Configuration Script${NC}"
echo "================================================"

# Function to check if doctl is installed
check_doctl() {
    if ! command -v doctl &> /dev/null; then
        echo -e "${RED}❌ doctl is not installed. Please install it first.${NC}"
        echo "Visit: https://docs.digitalocean.com/reference/doctl/how-to/install/"
        exit 1
    fi
    echo -e "${GREEN}✅ doctl is installed${NC}"
}

# Function to check domain resolution
check_domain() {
    local domain=$1
    echo -n "Checking $domain... "
    
    if curl -s --connect-timeout 10 -I "https://$domain" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Online${NC}"
        return 0
    elif curl -s --connect-timeout 10 -I "http://$domain" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  HTTP only (SSL pending)${NC}"
        return 1
    else
        echo -e "${RED}❌ Offline${NC}"
        return 2
    fi
}

# Function to get app status
get_app_status() {
    echo -e "\n${BLUE}📊 DigitalOcean App Status${NC}"
    echo "=========================="
    
    doctl apps get $DIGITALOCEAN_APP_ID --format "ID,Spec Name,Default Ingress,Active Deployment ID,In Progress Deployment ID"
    
    echo -e "\n${BLUE}🚀 Recent Deployments${NC}"
    echo "====================="
    doctl apps list-deployments $DIGITALOCEAN_APP_ID --format "ID,Cause,Progress,Phase,Created At" | head -5
}

# Function to check all domains
check_all_domains() {
    echo -e "\n${BLUE}🔍 Domain Status Check${NC}"
    echo "======================"
    
    # Check main domains
    check_domain $MAIN_DOMAIN
    check_domain $JOROMI_DOMAIN
    
    echo -e "\n${BLUE}🔍 Subdomain Status Check${NC}"
    echo "============================"
    
    # Check subdomains
    for subdomain in "${SUBDOMAINS[@]}"; do
        check_domain $subdomain
    done
}

# Function to show DNS configuration help
show_dns_help() {
    echo -e "\n${BLUE}📋 DNS Configuration Guide${NC}"
    echo "============================="
    echo -e "${YELLOW}For Hurricane Electric DNS management:${NC}"
    echo ""
    echo "1. Log into your Hurricane Electric account"
    echo "2. Navigate to DNS management for your domains"
    echo "3. Add the following records:"
    echo ""
    echo -e "${GREEN}For tetrixcorp.com:${NC}"
    echo "Type: A     Name: @           Value: 162.159.140.98"
    echo "Type: A     Name: @           Value: 172.66.0.96"
    echo "Type: CNAME Name: www         Value: tetrixcorp.com"
    echo "Type: CNAME Name: api         Value: tetrixcorp.com"
    echo "Type: CNAME Name: iot         Value: tetrixcorp.com"
    echo "Type: CNAME Name: vpn         Value: tetrixcorp.com"
    echo ""
    echo -e "${GREEN}For joromi.ai:${NC}"
    echo "Type: A     Name: @           Value: 162.159.140.98"
    echo "Type: A     Name: @           Value: 172.66.0.96"
    echo "Type: CNAME Name: www         Value: joromi.ai"
    echo ""
    echo -e "${YELLOW}Note:${NC} It may take 24-48 hours for DNS changes to propagate globally."
}

# Function to monitor domain health
monitor_domains() {
    echo -e "\n${BLUE}📊 Domain Health Monitor${NC}"
    echo "========================="
    
    while true; do
        clear
        echo -e "${BLUE}🌐 TETRIX Domain Monitor - $(date)${NC}"
        echo "================================================"
        
        check_all_domains
        
        echo -e "\n${YELLOW}Press Ctrl+C to stop monitoring${NC}"
        sleep 30
    done
}

# Function to test SSL certificates
test_ssl() {
    echo -e "\n${BLUE}🔒 SSL Certificate Test${NC}"
    echo "========================"
    
    for domain in $MAIN_DOMAIN $JOROMI_DOMAIN "${SUBDOMAINS[@]}"; do
        echo -n "Testing SSL for $domain... "
        
        if echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null; then
            echo -e "${GREEN}✅ SSL Valid${NC}"
        else
            echo -e "${RED}❌ SSL Invalid or Missing${NC}"
        fi
    done
}

# Function to show help
show_help() {
    echo -e "${BLUE}TETRIX Domain Configuration Script${NC}"
    echo "=========================================="
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  check       - Check all domain status"
    echo "  status      - Show DigitalOcean app status"
    echo "  dns         - Show DNS configuration help"
    echo "  ssl         - Test SSL certificates"
    echo "  monitor     - Start real-time domain monitoring"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 check"
    echo "  $0 status"
    echo "  $0 monitor"
}

# Main script logic
main() {
    check_doctl
    
    case "${1:-check}" in
        "check")
            check_all_domains
            ;;
        "status")
            get_app_status
            ;;
        "dns")
            show_dns_help
            ;;
        "ssl")
            test_ssl
            ;;
        "monitor")
            monitor_domains
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
