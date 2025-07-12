#!/bin/bash
set -e

# Pre-create the log file to avoid race condition
touch emulator.log

# Start Firebase Emulator in the background
firebase emulators:start --only firestore,auth --import=./emulator-data --export-on-exit=./emulator-data > emulator.log 2>&1 &
EMULATOR_PID=$!

# Wait for the emulator log file to exist
while [ ! -f emulator.log ]; do
  sleep 1
done

# Wait for the emulator to be ready
echo "Waiting for Firebase Emulator to start..."
until grep -q "All emulators ready" emulator.log; do
  sleep 1
done

echo "Emulator started. Running tests..."

# Set environment variables and run tests
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099

pnpm exec jest --config apps/api/jest.config.js

# Kill the emulator process after tests
kill $EMULATOR_PID
echo "Emulator stopped." 