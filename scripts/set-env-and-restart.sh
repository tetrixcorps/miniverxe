#!/bin/bash

# Set SinchChatLive Environment Variables
export SINCH_PROJECT_ID="01K1GYEHZAXEZVGDA34V3873KM"
export SINCH_APP_ID="01K1GYEHZAXEZVGDA34V3873KM"
export SINCH_CLIENT_ID="544cdba462974e05adc5140211c0311c"
export SINCH_CLIENT_SECRET="01K1GYEHZAXEZVGDA34V3873KM"
export SINCH_VIRTUAL_NUMBER="+16465799770"
export SINCH_BACKUP_NUMBER_1="+18888046762"
export SINCH_BACKUP_NUMBER_2="+12082792555"
export SINCH_BACKUP_NUMBER_3="+12082792555"

# Next.js Public Variables
export NEXT_PUBLIC_SINCH_API_KEY="544cdba462974e05adc5140211c0311c"
export NEXT_PUBLIC_SINCH_WIDGET_ID="shango-widget-2024"

# SHANGO Configuration
export SHANGO_SESSION_TIMEOUT="3600"
export SHANGO_MAX_MESSAGES="1000"
export SHANGO_DEFAULT_AGENT="shango-general"

# Firebase Configuration
export FIREBASE_API_KEY="AIzaSyBvQjK8X9Y2Z3A4B5C6D7E8F9G0H1I2J3K"
export FIREBASE_AUTH_DOMAIN="fir-rtc-7b55d.firebaseapp.com"
export FIREBASE_PROJECT_ID="fir-rtc-7b55d"
export FIREBASE_STORAGE_BUCKET="fir-rtc-7b55d.appspot.com"
export FIREBASE_MESSAGING_SENDER_ID="1073036366262"
export FIREBASE_APP_ID="1:1073036366262:web:a76a0e270753f3e9497117"

# Cross-Platform Configuration
export CROSS_PLATFORM_SESSION_SECRET="tetrix-joromi-session-secret-2024"

# Domain Configuration
export TETRIX_DOMAIN="tetrixcorp.com"
export JOROMI_DOMAIN="joromi.ai"

# Webhook Configuration
export WEBHOOK_BASE_URL="http://localhost:8080"

# Node Environment
export NODE_ENV="development"

echo "Environment variables set successfully!"
echo "Starting development server with SinchChatLive integration..."

# Start the development server
npm run dev
