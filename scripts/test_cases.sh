#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Testing Translation Service${NC}"

# Test 1: English to French
echo -e "\n${GREEN}Test 1: English to French${NC}"
python scripts/test_translation.py \
    --text "Hello, how are you?" \
    --target "fra"

# Test 2: French to English
echo -e "\n${GREEN}Test 2: French to English${NC}"
python scripts/test_translation.py \
    --text "Bonjour, comment allez-vous?" \
    --target "eng" \
    --source "fra"

# Test 3: English to Swahili
echo -e "\n${GREEN}Test 3: English to Swahili${NC}"
python scripts/test_translation.py \
    --text "Welcome to Africa" \
    --target "swh"

# Test 4: Yoruba to English
echo -e "\n${GREEN}Test 4: Yoruba to English${NC}"
python scripts/test_translation.py \
    --text "Bawo ni" \
    --target "eng" \
    --source "yor" 