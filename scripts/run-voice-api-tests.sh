#!/bin/bash

# TETRIX Cross-Platform Unit Testing Script
# This script runs comprehensive unit tests for the TETRIX cross-platform management system

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TEST_DIR="$PROJECT_ROOT/tests"
RESULTS_DIR="$PROJECT_ROOT/test-results"
COVERAGE_DIR="$RESULTS_DIR/coverage"

# Default options
COMPONENT="all"
COVERAGE=false
WATCH=false
VERBOSE=false
PARALLEL=true
TIMEOUT=30000
RETRY=2
REPORT_FORMAT="html"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --component=*)
      COMPONENT="${1#*=}"
      shift
      ;;
    --coverage)
      COVERAGE=true
      shift
      ;;
    --watch)
      WATCH=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --parallel)
      PARALLEL=true
      shift
      ;;
    --timeout=*)
      TIMEOUT="${1#*=}"
      shift
      ;;
    --retry=*)
      RETRY="${1#*=}"
      shift
      ;;
    --report=*)
      REPORT_FORMAT="${1#*=}"
      shift
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --component=<name>    Test specific component (tetrix|joromi|glo|all)"
      echo "  --coverage           Generate coverage report"
      echo "  --watch              Watch mode for development"
      echo "  --verbose             Verbose output"
      echo "  --parallel           Run tests in parallel"
      echo "  --timeout=<ms>       Test timeout in milliseconds"
      echo "  --retry=<count>      Retry failed tests"
      echo "  --report=<format>    Report format (html|json|junit)"
      echo "  --help               Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Logging functions
log() {
  echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

log_error() {
  echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

# Check dependencies
check_dependencies() {
  log "Checking dependencies..."
  
  # Check Node.js
  if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    exit 1
  fi
  
  # Check pnpm
  if ! command -v pnpm &> /dev/null; then
    log_error "pnpm is not installed"
    exit 1
  fi
  
  # Check Playwright
  if ! command -v npx &> /dev/null; then
    log_error "npx is not available"
    exit 1
  fi
  
  log_success "All dependencies found"
}

# Setup test environment
setup_environment() {
  log "Setting up test environment..."
  
  # Create test directories
  mkdir -p "$RESULTS_DIR"
  mkdir -p "$COVERAGE_DIR"
  mkdir -p "$TEST_DIR/unit"
  mkdir -p "$TEST_DIR/integration"
  mkdir -p "$TEST_DIR/functional"
  mkdir -p "$TEST_DIR/e2e"
  
  # Install Playwright browsers if not already installed
  if [ ! -d "$PROJECT_ROOT/node_modules/@playwright/test" ]; then
    log "Installing Playwright..."
    cd "$PROJECT_ROOT"
    pnpm install
    pnpm exec playwright install
  fi
  
  log_success "Test environment setup complete"
}

# Generate Playwright configuration
generate_playwright_config() {
  log "Generating Playwright configuration..."
  
  cat > "$PROJECT_ROOT/playwright.config.js" << EOF
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/unit',
  fullyParallel: $PARALLEL,
  forbidOnly: !!process.env.CI,
  retries: $RETRY,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'unit-tests',
      testMatch: '**/unit/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: $TIMEOUT
  }
});
EOF
  
  log_success "Playwright configuration generated"
}

# Run component tests
run_component_tests() {
  local component="$1"
  
  case "$component" in
    "tetrix")
      log "Running TETRIX Voice API tests..."
      run_tetrix_tests
      ;;
    "joromi")
      log "Running JoRoMi VoIP Management tests..."
      run_joromi_tests
      ;;
    "glo")
      log "Running GLO M2M Services tests..."
      run_glo_tests
      ;;
    "all")
      log "Running all component tests..."
      run_tetrix_tests
      run_joromi_tests
      run_glo_tests
      ;;
    *)
      log_error "Unknown component: $component"
      exit 1
      ;;
  esac
}

# Run TETRIX tests
run_tetrix_tests() {
  log "Running TETRIX Voice API unit tests..."
  
  cd "$PROJECT_ROOT"
  
  local test_command="npx playwright test tests/unit/ --config=playwright.config.js"
  
  if [ "$VERBOSE" = true ]; then
    test_command="$test_command --reporter=list"
  fi
  
  if [ "$WATCH" = true ]; then
    test_command="$test_command --watch"
  fi
  
  if [ "$PARALLEL" = true ]; then
    test_command="$test_command --workers=4"
  else
    test_command="$test_command --workers=1"
  fi
  
  if eval "$test_command"; then
    log_success "TETRIX tests completed successfully"
    return 0
  else
    log_error "TETRIX tests failed"
    return 1
  fi
}

# Run JoRoMi tests
run_joromi_tests() {
  log "Running JoRoMi VoIP Management tests..."
  
  local joromi_dir="$PROJECT_ROOT/../joromi"
  
  if [ ! -d "$joromi_dir" ]; then
    log_warning "JoRoMi directory not found: $joromi_dir"
    return 0
  fi
  
  cd "$joromi_dir"
  
  if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
      log "Installing JoRoMi dependencies..."
      pnpm install
    fi
    
    if [ -f "playwright.config.js" ]; then
      local test_command="npx playwright test tests/unit/ --config=playwright.config.js"
      
      if [ "$VERBOSE" = true ]; then
        test_command="$test_command --reporter=list"
      fi
      
      if eval "$test_command"; then
        log_success "JoRoMi tests completed successfully"
        return 0
      else
        log_error "JoRoMi tests failed"
        return 1
      fi
    else
      log_warning "JoRoMi Playwright config not found"
    fi
  else
    log_warning "JoRoMi package.json not found"
  fi
}

# Run GLO tests
run_glo_tests() {
  log "Running GLO M2M Services tests..."
  
  local glo_dir="$PROJECT_ROOT/../glo"
  
  if [ ! -d "$glo_dir" ]; then
    log_warning "GLO directory not found: $glo_dir"
    return 0
  fi
  
  cd "$glo_dir"
  
  if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
      log "Installing GLO dependencies..."
      pnpm install
    fi
    
    if [ -f "playwright.config.js" ]; then
      local test_command="npx playwright test tests/unit/ --config=playwright.config.js"
      
      if [ "$VERBOSE" = true ]; then
        test_command="$test_command --reporter=list"
      fi
      
      if eval "$test_command"; then
        log_success "GLO tests completed successfully"
        return 0
      else
        log_error "GLO tests failed"
        return 1
      fi
    else
      log_warning "GLO Playwright config not found"
    fi
  else
    log_warning "GLO package.json not found"
  fi
}

# Generate coverage report
generate_coverage_report() {
  if [ "$COVERAGE" = true ]; then
    log "Generating coverage report..."
    
    cd "$PROJECT_ROOT"
    
    local coverage_command="npx playwright test --reporter=html --output=test-results/coverage"
    
    if eval "$coverage_command"; then
      log_success "Coverage report generated"
      log "View coverage report at: $COVERAGE_DIR/index.html"
    else
      log_error "Failed to generate coverage report"
    fi
  fi
}

# Generate test report
generate_test_report() {
  log "Generating test report..."
  
  local report_file="$RESULTS_DIR/report.html"
  
  cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>TETRIX Cross-Platform Unit Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .summary { margin: 20px 0; }
        .component { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
    </style>
</head>
<body>
    <div class="header">
        <h1>TETRIX Cross-Platform Unit Test Report</h1>
        <p>Generated: $(date)</p>
        <p>Component: $COMPONENT</p>
        <p>Coverage: $COVERAGE</p>
        <p>Parallel: $PARALLEL</p>
    </div>
    
    <div class="summary">
        <h2>Test Summary</h2>
        <p>Component: $COMPONENT</p>
        <p>Coverage: $COVERAGE</p>
        <p>Parallel: $PARALLEL</p>
        <p>Timeout: ${TIMEOUT}ms</p>
        <p>Retry: $RETRY</p>
    </div>
    
    <div class="components">
        <h2>Component Results</h2>
        <div class="component">
            <h3>TETRIX Voice API</h3>
            <p>Services: voice-api, transcription, ai-response, texml</p>
        </div>
        <div class="component">
            <h3>JoRoMi VoIP Management</h3>
            <p>Services: voip-management, toll-free, ivr, sms</p>
        </div>
        <div class="component">
            <h3>GLO M2M Services</h3>
            <p>Services: m2m-auth, session-manager, telemetry, vpn-gateway</p>
        </div>
    </div>
</body>
</html>
EOF
  
  log_success "Test report generated: $report_file"
}

# Cleanup function
cleanup() {
  log "Cleaning up test environment..."
  
  # Remove test artifacts
  rm -rf "$RESULTS_DIR/screenshots"
  rm -rf "$RESULTS_DIR/videos"
  rm -rf "$RESULTS_DIR/traces"
  
  log_success "Test environment cleanup complete"
}

# Main execution
main() {
  log "🚀 Starting TETRIX Cross-Platform Unit Testing"
  log "Component: $COMPONENT"
  log "Coverage: $COVERAGE"
  log "Watch: $WATCH"
  log "Verbose: $VERBOSE"
  log "Parallel: $PARALLEL"
  log "Timeout: ${TIMEOUT}ms"
  log "Retry: $RETRY"
  log "Report Format: $REPORT_FORMAT"
  
  # Setup
  check_dependencies
  setup_environment
  generate_playwright_config
  
  # Run tests
  local all_passed=true
  
  if run_component_tests "$COMPONENT"; then
    log_success "All tests completed successfully"
  else
    log_error "Some tests failed"
    all_passed=false
  fi
  
  # Generate reports
  generate_coverage_report
  generate_test_report
  
  # Cleanup
  cleanup
  
  # Final results
  if [ "$all_passed" = true ]; then
    log_success "🎉 All unit tests completed successfully!"
    exit 0
  else
    log_error "❌ Some unit tests failed"
    exit 1
  fi
}

# Handle signals
trap cleanup EXIT
trap 'log_error "Test execution interrupted"; exit 1' INT TERM

# Run main function
main "$@"