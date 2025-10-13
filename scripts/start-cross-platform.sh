#!/bin/bash

# TETRIX Cross-Platform Management Script
# This script starts both TETRIX and JoRoMi applications for cross-platform development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 TETRIX Cross-Platform Management System${NC}"
echo "=============================================="
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to start TETRIX
start_tetrix() {
    echo -e "${YELLOW}🔧 Starting TETRIX Platform...${NC}"
    
    if check_port 8080; then
        echo -e "${GREEN}✅ TETRIX is already running on port 8080${NC}"
    else
        echo -e "${YELLOW}📦 Starting TETRIX development server...${NC}"
        cd /home/diegomartinez/Desktop/tetrix
        pnpm run dev > /dev/null 2>&1 &
        TETRIX_PID=$!
        echo $TETRIX_PID > .tetrix.pid
        echo -e "${GREEN}✅ TETRIX started with PID: $TETRIX_PID${NC}"
    fi
    
    echo -e "${BLUE}🌐 TETRIX URL: http://localhost:8080${NC}"
}

# Function to start JoRoMi
start_joromi() {
    echo -e "${PURPLE}🔧 Starting JoRoMi Platform...${NC}"
    
    if check_port 3000; then
        echo -e "${GREEN}✅ JoRoMi is already running on port 3000${NC}"
    else
        echo -e "${YELLOW}📦 Starting JoRoMi development server...${NC}"
        cd /home/diegomartinez/Desktop/joromi/frontend
        PORT=3000 npm run dev > /dev/null 2>&1 &
        JOROMI_PID=$!
        echo $JOROMI_PID > /home/diegomartinez/Desktop/joromi/frontend/.joromi.pid
        echo -e "${GREEN}✅ JoRoMi started with PID: $JOROMI_PID${NC}"
    fi
    
    echo -e "${PURPLE}🌐 JoRoMi URL: http://localhost:3000${NC}"
}

# Function to check status
check_status() {
    echo -e "${BLUE}📊 Cross-Platform Status Check${NC}"
    echo "================================"
    
    if check_port 8080; then
        echo -e "${GREEN}✅ TETRIX: Running on port 8080${NC}"
    else
        echo -e "${RED}❌ TETRIX: Not running${NC}"
    fi
    
    if check_port 3000; then
        echo -e "${GREEN}✅ JoRoMi: Running on port 3000${NC}"
    else
        echo -e "${RED}❌ JoRoMi: Not running${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}🔗 Cross-Platform Links:${NC}"
    echo "  • TETRIX Platform: http://localhost:8080"
    echo "  • JoRoMi Platform: http://localhost:3000"
    echo "  • JoRoMi Button in TETRIX: Click the red 'JoRoMi' button in the header"
}

# Function to stop all services
stop_all() {
    echo -e "${YELLOW}🛑 Stopping Cross-Platform Services...${NC}"
    
    # Stop TETRIX
    if [ -f .tetrix.pid ]; then
        TETRIX_PID=$(cat .tetrix.pid)
        if kill -0 $TETRIX_PID 2>/dev/null; then
            kill $TETRIX_PID
            echo -e "${GREEN}✅ TETRIX stopped${NC}"
        fi
        rm -f .tetrix.pid
    fi
    
    # Stop JoRoMi
    if [ -f /home/diegomartinez/Desktop/joromi/frontend/.joromi.pid ]; then
        JOROMI_PID=$(cat /home/diegomartinez/Desktop/joromi/frontend/.joromi.pid)
        if kill -0 $JOROMI_PID 2>/dev/null; then
            kill $JOROMI_PID
            echo -e "${GREEN}✅ JoRoMi stopped${NC}"
        fi
        rm -f /home/diegomartinez/Desktop/joromi/frontend/.joromi.pid
    fi
    
    # Kill any remaining processes on the ports
    pkill -f "astro dev" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    
    echo -e "${GREEN}✅ All services stopped${NC}"
}

# Main execution
case "${1:-start}" in
    "start")
        start_tetrix
        echo ""
        start_joromi
        echo ""
        check_status
        ;;
    "status")
        check_status
        ;;
    "stop")
        stop_all
        ;;
    "restart")
        stop_all
        echo ""
        sleep 2
        start_tetrix
        echo ""
        start_joromi
        echo ""
        check_status
        ;;
    *)
        echo -e "${BLUE}TETRIX Cross-Platform Management${NC}"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start    - Start both TETRIX and JoRoMi (default)"
        echo "  status   - Check status of both platforms"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo ""
        echo "Examples:"
        echo "  $0 start     # Start both platforms"
        echo "  $0 status    # Check if both are running"
        echo "  $0 stop      # Stop everything"
        echo "  $0 restart   # Restart everything"
        ;;
esac
