#!/bin/bash

# Fix TETRIX Application Domain Configuration
# Remove conflicting domains (joromi.ai and poisonedreligion.ai) from TETRIX app

set -e

echo "🔧 Fixing TETRIX Application Domain Configuration"
echo "================================================="

# App ID for tetrix-production-fixed
APP_ID="ca96485c-ee6b-401b-b1a2-8442c3bc7f04"

echo "📋 Current App ID: $APP_ID"

# Create updated app spec without conflicting domains
cat > tetrix-fixed-spec.yaml << 'EOF'
name: tetrix-production-fixed
region: fra

services:
  - name: tetrix-frontend
    github:
      repo: tetrixcorps/miniverxe
      branch: main
      deploy_on_push: true
    source_dir: /
    http_port: 8080
    instance_count: 1
    instance_size_slug: basic-xxs
    build_command: |
      # Clean up any conflicting lockfiles
      rm -f package-lock.json yarn.lock npm-shrinkwrap.json .yarnrc .yarnrc.yml
      # Install dependencies (pnpm already installed by buildpack)
      pnpm install --frozen-lockfile
      # Build the application
      pnpm run build
    run_command: pnpm run start
    envs:
      - key: NODE_ENV
        value: production
        scope: RUN_AND_BUILD_TIME
      - key: HOST
        value: 0.0.0.0
        scope: RUN_AND_BUILD_TIME
      - key: PORT
        value: "8080"
        scope: RUN_AND_BUILD_TIME
      - key: TETRIX_DOMAIN
        value: tetrixcorp.com
        scope: RUN_AND_BUILD_TIME
      - key: JOROMI_DOMAIN
        value: joromi.ai
        scope: RUN_AND_BUILD_TIME
      - key: POISONEDRELIGION_DOMAIN
        value: poisonedreligion.ai
        scope: RUN_AND_BUILD_TIME
      - key: CROSS_PLATFORM_SESSION_SECRET
        value: tetrix-joromi-session-secret-2024
        scope: RUN_AND_BUILD_TIME
      - key: SINCH_API_TOKEN
        value: 544cdba462974e05adc5140211c0311c
        scope: RUN_AND_BUILD_TIME
      - key: SINCH_SERVICE_PLAN_ID
        value: 01K1GYEHZAXEZVGDA34V3873KM
        scope: RUN_AND_BUILD_TIME
      - key: SINCH_VIRTUAL_NUMBER
        value: "+16465799770"
        scope: RUN_AND_BUILD_TIME
      - key: SINCH_BACKUP_NUMBER_1
        value: "+18888046762"
        scope: RUN_AND_BUILD_TIME
      - key: SINCH_BACKUP_NUMBER_2
        value: "+12082792555"
        scope: RUN_AND_BUILD_TIME
      - key: SINCH_BACKUP_NUMBER_3
        value: "+12082792555"
        scope: RUN_AND_BUILD_TIME
      - key: SINCH_CONVERSATION_PROJECT_ID
        value: 01K1GYEHZAXEZVGDA34V3873KM
        scope: RUN_AND_BUILD_TIME
      - key: NEXT_PUBLIC_SINCH_API_KEY
        value: 544cdba462974e05adc5140211c0311c
        scope: RUN_AND_BUILD_TIME
      - key: NEXT_PUBLIC_SINCH_WIDGET_ID
        value: shango-widget-2024
        scope: RUN_AND_BUILD_TIME
      - key: SHANGO_SESSION_TIMEOUT
        value: "3600"
        scope: RUN_AND_BUILD_TIME
      - key: SHANGO_MAX_MESSAGES
        value: "1000"
        scope: RUN_AND_BUILD_TIME
      - key: SHANGO_DEFAULT_AGENT
        value: shango-general
        scope: RUN_AND_BUILD_TIME
      - key: FIREBASE_API_KEY
        value: AIzaSyBvQjK8X9Y2Z3A4B5C6D7E8F9G0H1I2J3K
        scope: RUN_AND_BUILD_TIME
      - key: FIREBASE_AUTH_DOMAIN
        value: fir-rtc-7b55d.firebaseapp.com
        scope: RUN_AND_BUILD_TIME
      - key: FIREBASE_PROJECT_ID
        value: fir-rtc-7b55d
        scope: RUN_AND_BUILD_TIME
      - key: FIREBASE_STORAGE_BUCKET
        value: fir-rtc-7b55d.appspot.com
        scope: RUN_AND_BUILD_TIME
      - key: FIREBASE_MESSAGING_SENDER_ID
        value: "1073036366262"
        scope: RUN_AND_BUILD_TIME
      - key: FIREBASE_APP_ID
        value: 1:1073036366262:web:a76a0e270753f3e9497117
        scope: RUN_AND_BUILD_TIME
      - key: HOSTNAME
        value: 0.0.0.0
        scope: RUN_AND_BUILD_TIME
      - key: NODE_OPTIONS
        value: --max-old-space-size=512
        scope: RUN_AND_BUILD_TIME
    health_check:
      http_path: /api/health
      initial_delay_seconds: 60
      period_seconds: 15
      timeout_seconds: 10
      success_threshold: 1
      failure_threshold: 5

# TETRIX domains only (removed joromi.ai and poisonedreligion.ai)
domains:
  - domain: tetrixcorp.com
    type: PRIMARY
  - domain: www.tetrixcorp.com
    type: ALIAS
  - domain: api.tetrixcorp.com
    type: ALIAS
  - domain: iot.tetrixcorp.com
    type: ALIAS
  - domain: vpn.tetrixcorp.com
    type: ALIAS

ingress:
  rules:
    - match:
        path:
          prefix: /
      component:
        name: tetrix-frontend

alerts:
  - rule: DEPLOYMENT_FAILED
  - rule: DOMAIN_FAILED

features:
  - buildpack-stack=ubuntu-22
EOF

echo "✅ Created updated TETRIX app spec (tetrix-fixed-spec.yaml)"

# Update the TETRIX application
echo "🚀 Updating TETRIX application..."
doctl apps update $APP_ID --spec tetrix-fixed-spec.yaml

echo "✅ TETRIX application updated successfully!"

# Clean up
rm -f tetrix-fixed-spec.yaml

echo ""
echo "🎉 Domain configuration fixed!"
echo ""
echo "Next steps:"
echo "1. Create separate applications for JoRoMi and Code Academy"
echo "2. Deploy JoRoMi to joromi.ai"
echo "3. Deploy Code Academy to poisonedreligion.ai"
echo "4. Test all domain redirects"
echo ""
echo "Commands to create separate apps:"
echo "  doctl apps create --spec joromi-app-spec.yaml"
echo "  doctl apps create --spec code-academy-app-spec.yaml"
