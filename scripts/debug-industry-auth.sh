#!/bin/bash

echo "🔍 IndustryAuth Debug Script"
echo "============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules/@playwright" ]; then
    echo "Installing Playwright..."
    pnpm install
fi

# Run the debug test
echo "🧪 Running IndustryAuth debug tests..."
npx playwright test tests/industry-auth-debug.test.ts --headed

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed. Check the output above for details."
fi

echo ""
echo "📊 Debug Report:"
echo "To view detailed test results, open: playwright-report/index.html"
echo ""
echo "🔧 Manual Debug Commands:"
echo "1. Open browser console on https://tetrixcorp.com"
echo "2. Run: window.industryAuthDebugger.testModalFunctionality()"
echo "3. Run: window.industryAuthDebugger.testAPIEndpoints()"
echo "4. Run: window.industryAuthDebugger.getDebugReport()"
