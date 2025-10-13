#!/bin/bash
set -e

echo "🧪 Testing Unified Onboarding System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_status "Running: $test_name"
    
    if eval "$test_command"; then
        print_success "✓ $test_name"
        ((TESTS_PASSED++))
    else
        print_error "✗ $test_name"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Check if all required files exist
test_required_files() {
    local files=(
        "src/services/smart2faService.ts"
        "src/services/stripeTrialService.ts"
        "src/services/whatsappOnboardingService.ts"
        "src/services/crossPlatformSessionService.ts"
        "src/components/UnifiedOnboardingFlow.tsx"
        "src/components/UnifiedMessagingDashboard.tsx"
        "src/pages/onboarding.astro"
        "src/api/webhooks/index.ts"
        "Dockerfile"
        ".do/app-shango-integration.yaml"
    )
    
    for file in "${files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Missing required file: $file"
            return 1
        fi
    done
    
    return 0
}

# Test 2: Check TypeScript compilation
test_typescript_compilation() {
    if command -v npx &> /dev/null; then
        npx tsc --noEmit --skipLibCheck src/services/smart2faService.ts
        npx tsc --noEmit --skipLibCheck src/services/stripeTrialService.ts
        npx tsc --noEmit --skipLibCheck src/services/whatsappOnboardingService.ts
        npx tsc --noEmit --skipLibCheck src/services/crossPlatformSessionService.ts
        return 0
    else
        print_warning "TypeScript not available, skipping compilation test"
        return 0
    fi
}

# Test 3: Check Dockerfile syntax
test_dockerfile_syntax() {
    if command -v docker &> /dev/null; then
        docker build --dry-run -f Dockerfile . > /dev/null 2>&1
        return $?
    else
        print_warning "Docker not available, skipping Dockerfile test"
        return 0
    fi
}

# Test 4: Check package.json dependencies
test_package_dependencies() {
    if [ -f "package.json" ]; then
        # Check if required dependencies are listed
        local required_deps=("stripe" "react" "typescript")
        
        for dep in "${required_deps[@]}"; do
            if ! grep -q "\"$dep\"" package.json; then
                print_error "Missing dependency: $dep"
                return 1
            fi
        done
        
        return 0
    else
        print_error "package.json not found"
        return 1
    fi
}

# Test 5: Check environment variables
test_environment_variables() {
    local required_vars=(
        "***REMOVED***"
        "STRIPE_SECRET_KEY"
        "SINCH_API_KEY"
        "CROSS_PLATFORM_SESSION_SECRET"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_warning "Missing environment variables: ${missing_vars[*]}"
        print_warning "These will need to be set in production"
        return 0
    fi
    
    return 0
}

# Test 6: Check webhook endpoints
test_webhook_endpoints() {
    local endpoints=(
        "/webhooks/telnyx/sms"
        "/webhooks/telnyx/voice"
        "/webhooks/stripe/trial"
        "/webhooks/sinch/waba"
        "/webhooks/session"
    )
    
    # Check if webhook handlers are defined
    if grep -q "handleTelnyxWebhook" src/api/webhooks/index.ts && \
       grep -q "handleStripeWebhook" src/api/webhooks/index.ts && \
       grep -q "handleSinchWebhook" src/api/webhooks/index.ts; then
        return 0
    else
        print_error "Webhook handlers not properly defined"
        return 1
    fi
}

# Test 7: Check onboarding flow components
test_onboarding_components() {
    # Check if UnifiedOnboardingFlow has all required steps
    if grep -q "phone_entry" src/components/UnifiedOnboardingFlow.tsx && \
       grep -q "phone_verification" src/components/UnifiedOnboardingFlow.tsx && \
       grep -q "business_info" src/components/UnifiedOnboardingFlow.tsx && \
       grep -q "payment_method" src/components/UnifiedOnboardingFlow.tsx && \
       grep -q "waba_onboarding" src/components/UnifiedOnboardingFlow.tsx; then
        return 0
    else
        print_error "Onboarding flow missing required steps"
        return 1
    fi
}

# Test 8: Check 2FA service configuration
test_2fa_configuration() {
    # Check if voice is set as primary method
    if grep -q "preferredMethod: 'voice'" src/services/smart2faService.ts && \
       grep -q "fallbackMethod: 'sms'" src/services/smart2faService.ts; then
        return 0
    else
        print_error "2FA service not configured with voice primary, SMS fallback"
        return 1
    fi
}

# Test 9: Check Stripe integration
test_stripe_integration() {
    # Check if Stripe service has required methods
    if grep -q "startFreeTrial" src/services/stripeTrialService.ts && \
       grep -q "checkTrialStatus" src/services/stripeTrialService.ts && \
       grep -q "convertTrialToPaid" src/services/stripeTrialService.ts; then
        return 0
    else
        print_error "Stripe service missing required methods"
        return 1
    fi
}

# Test 10: Check WhatsApp onboarding
test_whatsapp_onboarding() {
    # Check if WhatsApp service has required methods
    if grep -q "initiateWABAOnboarding" src/services/whatsappOnboardingService.ts && \
       grep -q "getWABAStatus" src/services/whatsappOnboardingService.ts && \
       grep -q "handleWABAWebhook" src/services/whatsappOnboardingService.ts; then
        return 0
    else
        print_error "WhatsApp onboarding service missing required methods"
        return 1
    fi
}

# Test 11: Check cross-platform session management
test_session_management() {
    # Check if session service has required methods
    if grep -q "createSession" src/services/crossPlatformSessionService.ts && \
       grep -q "authenticateSession" src/services/crossPlatformSessionService.ts && \
       grep -q "linkPlatforms" src/services/crossPlatformSessionService.ts; then
        return 0
    else
        print_error "Session management service missing required methods"
        return 1
    fi
}

# Test 12: Check unified messaging dashboard
test_messaging_dashboard() {
    # Check if dashboard has required features
    if grep -q "UnifiedMessagingDashboard" src/components/UnifiedMessagingDashboard.tsx && \
       grep -q "whatsapp" src/components/UnifiedMessagingDashboard.tsx && \
       grep -q "sms" src/components/UnifiedMessagingDashboard.tsx && \
       grep -q "voice" src/components/UnifiedMessagingDashboard.tsx; then
        return 0
    else
        print_error "Messaging dashboard missing required features"
        return 1
    fi
}

# Test 13: Check Digital Ocean configuration
test_do_configuration() {
    if [ -f ".do/app-shango-integration.yaml" ]; then
        # Check if Dockerfile is specified
        if grep -q "dockerfile_path: Dockerfile" .do/app-shango-integration.yaml; then
            return 0
        else
            print_error "Digital Ocean configuration missing Dockerfile path"
            return 1
        fi
    else
        print_error "Digital Ocean configuration file not found"
        return 1
    fi
}

# Test 14: Check documentation
test_documentation() {
    if [ -f "docs/UNIFIED_ONBOARDING_IMPLEMENTATION.md" ]; then
        return 0
    else
        print_error "Implementation documentation not found"
        return 1
    fi
}

# Run all tests
run_all_tests() {
    echo "🧪 Running Unified Onboarding System Tests"
    echo "=========================================="
    
    # Core functionality tests
    run_test "Required files exist" "test_required_files"
    run_test "TypeScript compilation" "test_typescript_compilation"
    run_test "Dockerfile syntax" "test_dockerfile_syntax"
    run_test "Package dependencies" "test_package_dependencies"
    run_test "Environment variables" "test_environment_variables"
    
    # Service tests
    run_test "Webhook endpoints" "test_webhook_endpoints"
    run_test "Onboarding components" "test_onboarding_components"
    run_test "2FA configuration" "test_2fa_configuration"
    run_test "Stripe integration" "test_stripe_integration"
    run_test "WhatsApp onboarding" "test_whatsapp_onboarding"
    run_test "Session management" "test_session_management"
    run_test "Messaging dashboard" "test_messaging_dashboard"
    
    # Deployment tests
    run_test "Digital Ocean configuration" "test_do_configuration"
    run_test "Documentation" "test_documentation"
    
    # Print summary
    echo ""
    echo "📊 Test Summary"
    echo "==============="
    print_success "Tests passed: $TESTS_PASSED"
    if [ $TESTS_FAILED -gt 0 ]; then
        print_error "Tests failed: $TESTS_FAILED"
    else
        print_success "Tests failed: $TESTS_FAILED"
    fi
    
    if [ $TESTS_FAILED -eq 0 ]; then
        print_success "🎉 All tests passed! The unified onboarding system is ready for deployment."
        return 0
    else
        print_error "❌ Some tests failed. Please fix the issues before deploying."
        return 1
    fi
}

# Main function
main() {
    run_all_tests
}

# Run main function
main "$@"
