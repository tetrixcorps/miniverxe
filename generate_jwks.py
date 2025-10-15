#!/usr/bin/env python3
"""
Generate JWKS (JSON Web Key Set) for Epic FHIR integration
"""
import json
import uuid
import base64
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend

def int_to_base64url(value):
    """Convert integer to base64url encoding (without padding)"""
    # Convert integer to bytes
    byte_length = (value.bit_length() + 7) // 8
    value_bytes = value.to_bytes(byte_length, byteorder='big')
    
    # Base64 encode and make URL safe
    encoded = base64.urlsafe_b64encode(value_bytes).decode('ascii')
    return encoded.rstrip('=')  # Remove padding

def generate_jwks():
    """Generate JWKS from the RSA key pair"""
    try:
        # Load private key
        with open('private_key.pem', 'rb') as key_file:
            private_key = serialization.load_pem_private_key(
                key_file.read(),
                password=None,
                backend=default_backend()
            )
        
        # Get public key
        public_key = private_key.public_key()
        
        # Get public key numbers
        public_numbers = public_key.public_numbers()
        
        # Create JWK
        jwk = {
            "kty": "RSA",
            "kid": "tetrix-epic-key-2025",  # Fixed key ID for consistency
            "use": "sig",
            "alg": "RS256",
            "n": int_to_base64url(public_numbers.n),
            "e": int_to_base64url(public_numbers.e)
        }
        
        # Create JWKS
        jwks = {
            "keys": [jwk]
        }
        
        return jwks, jwk["kid"]
        
    except Exception as e:
        print(f"Error generating JWKS: {e}")
        return None, None

if __name__ == "__main__":
    # Generate JWKS
    jwks_data, key_id = generate_jwks()
    
    if jwks_data:
        # Save to file
        with open('jwks.json', 'w') as f:
            json.dump(jwks_data, f, indent=2)
        
        print("✅ JWKS generated successfully!")
        print(f"🔑 Key ID: {key_id}")
        print(f"📄 JWKS saved to: jwks.json")
        print(f"\n📋 JWKS content:")
        print(json.dumps(jwks_data, indent=2))
    else:
        print("❌ Failed to generate JWKS")
