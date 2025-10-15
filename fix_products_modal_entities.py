#!/usr/bin/env python3
"""
Script to fix HTML entities in ProductsModal.astro
"""

import re

# Read the file
with open('src/components/ProductsModal.astro', 'r', encoding='utf-8') as f:
    content = f.read()

# HTML entity to emoji mappings
entity_mappings = {
    '&#128222;': '📞',  # Phone
    '&#127908;': '🎙️',  # Microphone
    '&#9742;': '☎️',    # Telephone
    '&#128273;': '🔐',  # Lock
    '&#128241;': '📱',  # Mobile phone
    '&#127891;': '🎓',  # Graduation cap
    '&#128172;': '💬',  # Speech bubble
    '&#129302;': '🤖',  # Robot
    '&#129504;': '🧠',  # Brain
    '&#127991;': '🏷️',  # Label
    '&#9889;': '⚡',    # Lightning
    '&#128188;': '💼',  # Briefcase
    '&#8635;': '🔄',    # Counterclockwise arrows
    '&#128176;': '💰',  # Money bag
    '&#127981;': '🏢',  # Office building
    '&#127973;': '🏥',  # Hospital
    '&#127974;': '🏦',  # Bank
    '&#128722;': '🛒',  # Shopping cart
    '&#128755;': '🚛',  # Delivery truck
    '&#8594;': '→',     # Right arrow
}

# Replace all HTML entities
for entity, emoji in entity_mappings.items():
    content = content.replace(entity, emoji)

# Write the file back
with open('src/components/ProductsModal.astro', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed all HTML entities in ProductsModal.astro")
