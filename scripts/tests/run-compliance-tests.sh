#!/bin/bash
# Script to run compliance call flow tests

echo "Running Compliant Call Flow Tests..."
echo "===================================="
echo ""

cd "$(dirname "$0")"

echo "1. Running Unit Tests: compliantIVRService.test.ts"
pnpm exec vitest run tests/unit/compliantIVRService.test.ts --reporter=verbose

echo ""
echo "2. Running Unit Tests: webhookOrchestration.test.ts"
pnpm exec vitest run tests/unit/webhookOrchestration.test.ts --reporter=verbose

echo ""
echo "3. Running Functional Tests: compliantCallFlow.test.ts"
pnpm exec vitest run tests/functional/compliantCallFlow.test.ts --reporter=verbose

echo ""
echo "4. Running Functional Tests: webhookHandler.test.ts"
pnpm exec vitest run tests/functional/webhookHandler.test.ts --reporter=verbose

echo ""
echo "===================================="
echo "All tests completed!"
