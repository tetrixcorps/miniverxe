from flask import Flask, request
from firebase_auth_middleware import verify_firebase_token

app = Flask(__name__)

@app.before_request
def require_auth():
    # Only protect Label Studio endpoints
    if request.path.startswith('/label-studio/'):
        result = verify_firebase_token()
        if result is not None:
            return result

# ... existing routes ... 