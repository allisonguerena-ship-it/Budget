#!/bin/bash
# Test Runner for POT Budget
# Runs all tests in test/ directory and reports results
# 
# Prerequisites: Node.js installed
# Usage: ./test/run-tests.sh

set -e

echo "======================================"
echo "POT Budget - Test Suite"
echo "======================================"
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo ""
    echo "To run tests, install Node.js:"
    echo "  - macOS: brew install node"
    echo "  - Ubuntu/Debian: sudo apt-get install nodejs"
    echo "  - Windows: Download from https://nodejs.org/"
    echo ""
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

TESTS=(
    "test/budget.test.js"
    "test/weeks.test.js"
    "test/storage.test.js"
    "test/smoke_test_logic.js"
)

PASSED=0
FAILED=0

for test in "${TESTS[@]}"; do
    if [ -f "$test" ]; then
        echo "Running: $test"
        if node "$test" 2>&1; then
            ((PASSED++))
        else
            ((FAILED++))
        fi
        echo ""
    else
        echo "Skipping: $test (file not found)"
    fi
done

echo "======================================"
echo "Summary: $PASSED passed, $FAILED failed"
echo "======================================"

if [ $FAILED -eq 0 ]; then
    echo "✅ All tests passed!"
    exit 0
else
    echo "❌ Some tests failed"
    exit 1
fi
