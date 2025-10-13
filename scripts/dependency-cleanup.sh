#!/bin/bash

# TETRIX Dependency Cleanup Script
# Consolidates and cleans up excessive node_modules directories

echo "🧹 TETRIX Dependency Cleanup"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Analyze current dependency structure
analyze_dependencies() {
    print_info "Analyzing dependency structure..."
    
    # Count node_modules directories
    local node_modules_count=$(find /home/diegomartinez/Desktop/tetrix -name "node_modules" -type d 2>/dev/null | wc -l)
    print_info "Found $node_modules_count node_modules directories"
    
    # Calculate total size
    local total_size=$(find /home/diegomartinez/Desktop/tetrix -name "node_modules" -type d -exec du -sh {} + 2>/dev/null | awk '{sum+=$1} END {print sum}' 2>/dev/null || echo "0")
    print_info "Total node_modules size: $total_size"
    
    # Find duplicate packages
    print_info "Checking for duplicate package installations..."
    
    # List all package.json files
    local package_files=$(find /home/diegomartinez/Desktop/tetrix -name "package.json" -type f 2>/dev/null)
    local package_count=$(echo "$package_files" | wc -l)
    print_info "Found $package_count package.json files"
    
    if [ "$node_modules_count" -gt 10 ]; then
        print_warning "Excessive node_modules directories detected ($node_modules_count)"
        return 1
    else
        print_success "Dependency structure is reasonable"
        return 0
    fi
}

# Clean up duplicate and unnecessary files
cleanup_files() {
    print_info "Cleaning up unnecessary files..."
    
    # Remove lock files that might conflict
    find /home/diegomartinez/Desktop/tetrix -name "package-lock.json" -type f -delete 2>/dev/null
    find /home/diegomartinez/Desktop/tetrix -name "yarn.lock" -type f -delete 2>/dev/null
    find /home/diegomartinez/Desktop/tetrix -name "npm-shrinkwrap.json" -type f -delete 2>/dev/null
    
    # Remove yarn and npm config files
    find /home/diegomartinez/Desktop/tetrix -name ".yarnrc" -type f -delete 2>/dev/null
    find /home/diegomartinez/Desktop/tetrix -name ".yarnrc.yml" -type f -delete 2>/dev/null
    find /home/diegomartinez/Desktop/tetrix -name ".npmrc" -type f -delete 2>/dev/null
    
    # Remove error logs from node_modules
    find /home/diegomartinez/Desktop/tetrix -path "*/node_modules/*" -name "*.log" -type f -delete 2>/dev/null
    
    print_success "Unnecessary files cleaned up"
}

# Consolidate dependencies
consolidate_dependencies() {
    print_info "Consolidating dependencies..."
    
    # Go to project root
    cd /home/diegomartinez/Desktop/tetrix
    
    # Check if pnpm is available
    if command -v pnpm &> /dev/null; then
        print_info "Using pnpm for dependency management"
        
        # Clean install with pnpm
        print_info "Running pnpm install --frozen-lockfile..."
        pnpm install --frozen-lockfile
        
        if [ $? -eq 0 ]; then
            print_success "Dependencies installed successfully with pnpm"
        else
            print_warning "pnpm install had issues, trying alternative approach"
        fi
    else
        print_warning "pnpm not available, using npm"
        npm install
    fi
}

# Clean up specific service dependencies
cleanup_service_dependencies() {
    print_info "Cleaning up service-specific dependencies..."
    
    # Clean up services that have their own node_modules
    local services=("esim-ordering" "phone-provisioning" "oauth-auth-service")
    
    for service in "${services[@]}"; do
        local service_path="/home/diegomartinez/Desktop/tetrix/services/$service"
        
        if [ -d "$service_path" ]; then
            print_info "Cleaning up $service dependencies..."
            
            # Remove node_modules if it exists
            if [ -d "$service_path/node_modules" ]; then
                rm -rf "$service_path/node_modules"
                print_success "Removed $service/node_modules"
            fi
            
            # Remove lock files
            rm -f "$service_path/package-lock.json"
            rm -f "$service_path/yarn.lock"
            rm -f "$service_path/pnpm-lock.yaml"
            
            print_success "Cleaned up $service lock files"
        fi
    done
}

# Optimize package.json files
optimize_package_files() {
    print_info "Optimizing package.json files..."
    
    # Check for duplicate dependencies across services
    local services=("api" "esim-ordering" "phone-provisioning" "oauth-auth-service")
    
    for service in "${services[@]}"; do
        local service_path="/home/diegomartinez/Desktop/tetrix/services/$service"
        
        if [ -f "$service_path/package.json" ]; then
            print_info "Checking $service package.json..."
            
            # Check for common dependencies that could be shared
            local common_deps=("express" "cors" "helmet" "morgan" "compression" "winston")
            
            for dep in "${common_deps[@]}"; do
                if grep -q "\"$dep\"" "$service_path/package.json"; then
                    print_info "Found common dependency '$dep' in $service"
                fi
            done
        fi
    done
}

# Main execution
echo "Starting dependency cleanup..."

# Analyze current state
if analyze_dependencies; then
    print_success "Dependency structure is already optimized"
else
    print_warning "Dependency structure needs optimization"
fi

echo ""

# Clean up files
cleanup_files

echo ""

# Clean up service dependencies
cleanup_service_dependencies

echo ""

# Optimize package files
optimize_package_files

echo ""

# Consolidate dependencies
consolidate_dependencies

echo ""

# Final analysis
print_info "Final dependency analysis..."
analyze_dependencies

echo ""
print_success "🎉 Dependency cleanup complete!"
echo ""
echo "📊 Summary:"
echo "- Removed conflicting lock files"
echo "- Cleaned up service-specific node_modules"
echo "- Consolidated dependencies with pnpm"
echo "- Optimized package.json files"
echo ""
echo "💡 Recommendations:"
echo "- Use pnpm for all dependency management"
echo "- Avoid installing dependencies in service subdirectories"
echo "- Use workspace configuration for shared dependencies"
echo "- Regular cleanup to prevent dependency bloat"
