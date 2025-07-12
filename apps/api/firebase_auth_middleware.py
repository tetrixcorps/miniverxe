import os
import firebase_admin
from firebase_admin import credentials, auth
from flask import request, jsonify

# Initialize Firebase Admin SDK only once
if not firebase_admin._apps:
    cred = credentials.Certificate(os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"))
    firebase_admin.initialize_app(cred)

def verify_firebase_token():
    id_token = request.headers.get('Authorization')
    if not id_token:
        return jsonify({'error': 'Missing token'}), 401
    try:
        # Remove 'Bearer ' prefix if present
        if id_token.startswith('Bearer '):
            id_token = id_token[7:]
        decoded_token = auth.verify_id_token(id_token)
        request.user = decoded_token
    except Exception as e:
        return jsonify({'error': 'Invalid token', 'details': str(e)}), 401 