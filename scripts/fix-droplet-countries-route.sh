#!/bin/bash

# Script to add missing /api/v2/auth/countries route to droplet backend

DROPLET_IP="207.154.193.187"
DROPLET_USER="root"
DROPLET_PATH="/root/tetrix"

# Try to connect to droplet with SSH key
SSH_KEY="${HOME}/.ssh/tetrix_droplet_key"
if [ -f "$SSH_KEY" ]; then
    SSH_CMD="ssh -i $SSH_KEY"
elif [ -f "${SSH_KEY}.pem" ]; then
    SSH_CMD="ssh -i ${SSH_KEY}.pem"
else
    SSH_CMD="ssh"
fi

echo "=========================================="
echo "ADDING MISSING /api/v2/auth/countries ROUTE"
echo "=========================================="
echo ""

# Add the route
echo "=== Adding /api/v2/auth/countries route ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} << 'EOF'
cd /root/tetrix

# Check if route already exists
if grep -q 'app.get.*"/api/v2/auth/countries"' backend/src/server-with-db.ts; then
    echo "✅ Route already exists, skipping..."
else
    # Add the route after the existing countries route
    # Find the line number of the closing brace for the existing route
    LINE_NUM=$(grep -n 'app.get.*"/api/tetrix/auth/countries"' backend/src/server-with-db.ts | cut -d: -f1)
    if [ -n "$LINE_NUM" ]; then
        # Find the closing brace (look for the line after the message)
        CLOSE_LINE=$(sed -n "${LINE_NUM},350p" backend/src/server-with-db.ts | grep -n '^});$' | head -1 | cut -d: -f1)
        if [ -n "$CLOSE_LINE" ]; then
            INSERT_LINE=$((LINE_NUM + CLOSE_LINE))
            # Insert the new route
            sed -i "${INSERT_LINE}a\\
\\
// Get supported countries for phone formatting - v2 API\\
app.get('/api/v2/auth/countries', (req, res) => {\\
  return res.json({\\
    success: true,\\
    countries: [\\
      { code: '+1', name: 'United States 🇺🇸', callingCode: '+1' },\\
      { code: '+1', name: 'Canada 🇨🇦', callingCode: '+1' },\\
      { code: '+44', name: 'United Kingdom 🇬🇧', callingCode: '+44' },\\
      { code: '+61', name: 'Australia 🇦🇺', callingCode: '+61' },\\
      { code: '+64', name: 'New Zealand 🇳🇿', callingCode: '+64' },\\
      { code: '+27', name: 'South Africa 🇿🇦', callingCode: '+27' },\\
      { code: '+971', name: 'UAE 🇦🇪', callingCode: '+971' },\\
      { code: '+966', name: 'Saudi Arabia 🇸🇦', callingCode: '+966' },\\
      { code: '+33', name: 'France 🇫🇷', callingCode: '+33' },\\
      { code: '+49', name: 'Germany 🇩🇪', callingCode: '+49' },\\
      { code: '+39', name: 'Italy 🇮🇹', callingCode: '+39' },\\
      { code: '+34', name: 'Spain 🇪🇸', callingCode: '+34' },\\
      { code: '+31', name: 'Netherlands 🇳🇱', callingCode: '+31' },\\
      { code: '+32', name: 'Belgium 🇧🇪', callingCode: '+32' },\\
      { code: '+41', name: 'Switzerland 🇨🇭', callingCode: '+41' },\\
      { code: '+43', name: 'Austria 🇦🇹', callingCode: '+43' },\\
      { code: '+45', name: 'Denmark 🇩🇰', callingCode: '+45' },\\
      { code: '+46', name: 'Sweden 🇸🇪', callingCode: '+46' },\\
      { code: '+47', name: 'Norway 🇳🇴', callingCode: '+47' },\\
      { code: '+358', name: 'Finland 🇫🇮', callingCode: '+358' },\\
      { code: '+48', name: 'Poland 🇵🇱', callingCode: '+48' },\\
      { code: '+353', name: 'Ireland 🇮🇪', callingCode: '+353' },\\
      { code: '+351', name: 'Portugal 🇵🇹', callingCode: '+351' },\\
      { code: '+30', name: 'Greece 🇬🇷', callingCode: '+30' },\\
      { code: '+90', name: 'Turkey 🇹🇷', callingCode: '+90' },\\
      { code: '+7', name: 'Russia 🇷🇺', callingCode: '+7' },\\
      { code: '+380', name: 'Ukraine 🇺🇦', callingCode: '+380' },\\
      { code: '+86', name: 'China 🇨🇳', callingCode: '+86' },\\
      { code: '+81', name: 'Japan 🇯🇵', callingCode: '+81' },\\
      { code: '+82', name: 'South Korea 🇰🇷', callingCode: '+82' },\\
      { code: '+886', name: 'Taiwan 🇹🇼', callingCode: '+886' },\\
      { code: '+852', name: 'Hong Kong 🇭🇰', callingCode: '+852' },\\
      { code: '+65', name: 'Singapore 🇸🇬', callingCode: '+65' },\\
      { code: '+60', name: 'Malaysia 🇲🇾', callingCode: '+60' },\\
      { code: '+66', name: 'Thailand 🇹🇭', callingCode: '+66' },\\
      { code: '+62', name: 'Indonesia 🇮🇩', callingCode: '+62' },\\
      { code: '+63', name: 'Philippines 🇵🇭', callingCode: '+63' },\\
      { code: '+84', name: 'Vietnam 🇻🇳', callingCode: '+84' },\\
      { code: '+91', name: 'India 🇮🇳', callingCode: '+91' },\\
      { code: '+92', name: 'Pakistan 🇵🇰', callingCode: '+92' },\\
      { code: '+880', name: 'Bangladesh 🇧🇩', callingCode: '+880' },\\
      { code: '+52', name: 'Mexico 🇲🇽', callingCode: '+52' },\\
      { code: '+55', name: 'Brazil 🇧🇷', callingCode: '+55' },\\
      { code: '+54', name: 'Argentina 🇦🇷', callingCode: '+54' },\\
      { code: '+56', name: 'Chile 🇨🇱', callingCode: '+56' },\\
      { code: '+57', name: 'Colombia 🇨🇴', callingCode: '+57' },\\
      { code: '+51', name: 'Peru 🇵🇪', callingCode: '+51' },\\
      { code: '+58', name: 'Venezuela 🇻🇪', callingCode: '+58' },\\
      { code: '+20', name: 'Egypt 🇪🇬', callingCode: '+20' },\\
      { code: '+234', name: 'Nigeria 🇳🇬', callingCode: '+234' },\\
      { code: '+254', name: 'Kenya 🇰🇪', callingCode: '+254' },\\
      { code: '+233', name: 'Ghana 🇬🇭', callingCode: '+233' },\\
      { code: '+972', name: 'Israel 🇮🇱', callingCode: '+972' }\\
    ],\\
    total: 55,\\
    message: 'Telnyx Verify API supports 200+ countries globally. These are the most common options.'\\
  });\\
});
" backend/src/server-with-db.ts
            echo "✅ Route added successfully"
        else
            echo "❌ Could not find insertion point"
        fi
    else
        echo "❌ Could not find existing countries route"
    fi
fi
EOF

echo ""

# Verify the fix
echo "=== Verifying route was added ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && grep -A 2 'app.get.*\"/api/v2/auth/countries\"' backend/src/server-with-db.ts | head -5"
echo ""

# Rebuild backend container
echo "=== Rebuilding Backend Container ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} << 'EOF'
cd /root/tetrix

echo "Stopping backend container..."
docker-compose stop tetrix-backend || docker compose stop tetrix-backend

echo "Rebuilding backend container..."
docker-compose build --no-cache tetrix-backend || docker compose build --no-cache tetrix-backend

echo "Starting backend container..."
docker-compose up -d tetrix-backend || docker compose up -d tetrix-backend

echo "Waiting for backend to be healthy..."
sleep 10

echo "Checking backend status..."
docker-compose ps tetrix-backend || docker compose ps tetrix-backend
EOF

echo ""

echo "=========================================="
echo "✅ Fix complete! Backend should now have /api/v2/auth/countries route"
echo "=========================================="

