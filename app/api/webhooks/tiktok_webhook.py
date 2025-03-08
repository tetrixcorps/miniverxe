from fastapi import APIRouter, Request, HTTPException, Depends
import hmac
import hashlib
import time
from app.config import settings
from app.services.tiktok.webhook_handler import TikTokWebhookHandler

router = APIRouter()

async def verify_webhook_signature(request: Request):
    """Verify TikTok webhook signature"""
    # Get X-Tiktok-Event, X-Tiktok-Nonce, X-Tiktok-Timestamp, X-Tiktok-Signature headers
    event = request.headers.get("X-Tiktok-Event")
    nonce = request.headers.get("X-Tiktok-Nonce")
    timestamp = request.headers.get("X-Tiktok-Timestamp")
    signature = request.headers.get("X-Tiktok-Signature")
    
    if not all([event, nonce, timestamp, signature]):
        raise HTTPException(status_code=400, detail="Missing required headers")
    
    # Verify timestamp is within tolerance (10 minutes)
    current_time = int(time.time())
    request_time = int(timestamp)
    if abs(current_time - request_time) > 600:
        raise HTTPException(status_code=400, detail="Request timestamp out of range")
    
    # Verify signature
    body = await request.body()
    message = f"{timestamp}.{nonce}.{body.decode('utf-8')}"
    expected_signature = hmac.new(
        settings.TIKTOK_WEBHOOK_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    
    if signature != expected_signature:
        raise HTTPException(status_code=403, detail="Invalid signature")
    
    return {"event": event, "body": body}

@router.post("/tiktok")
async def tiktok_webhook(
    verified_data = Depends(verify_webhook_signature),
    webhook_handler: TikTokWebhookHandler = Depends()
):
    """Handle TikTok webhooks"""
    event = verified_data["event"]
    body = verified_data["body"]
    
    try:
        result = await webhook_handler.handle_event(event, body)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 