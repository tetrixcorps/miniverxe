from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
import json
import asyncio
from app.core.config.auth_manager import get_current_user, AuthManager
from app.services.voip.voip_service import VoipService
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger("voip_api")
voip_service = VoipService()
auth_manager = AuthManager()

class CreateCallRequest(BaseModel):
    callee_id: str
    options: Optional[Dict[str, Any]] = None
    
class CallEventRequest(BaseModel):
    event_type: str
    data: Dict[str, Any]

@router.post("/voip/calls")
async def create_call(
    request: CreateCallRequest,
    current_user = Depends(get_current_user)
):
    """Create a new VOIP call."""
    try:
        # Initialize service if needed
        if not getattr(voip_service, "initialized", False):
            await voip_service.initialize()
            
        # Create call
        call = await voip_service.create_call(
            caller_id=current_user["id"],
            callee_id=request.callee_id,
            options=request.options
        )
        
        return call
        
    except Exception as e:
        logger.error(f"Error creating call: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/voip/calls/{call_id}")
async def end_call(
    call_id: str,
    current_user = Depends(get_current_user)
):
    """End an active call."""
    try:
        # Get call first to verify ownership
        call = await voip_service.get_call(call_id)
        
        # Verify user is part of this call
        if call["caller_id"] != current_user["id"] and call["callee_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to end this call")
            
        # End the call
        result = await voip_service.end_call(call_id)
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error ending call: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voip/calls")
async def list_calls(
    current_user = Depends(get_current_user)
):
    """List all active calls for the user."""
    try:
        calls = await voip_service.list_active_calls(user_id=current_user["id"])
        return calls
        
    except Exception as e:
        logger.error(f"Error listing calls: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/voip/calls/{call_id}/events")
async def send_call_event(
    call_id: str,
    request: CallEventRequest,
    current_user = Depends(get_current_user)
):
    """Send an event to a call."""
    try:
        # Get call first to verify ownership
        call = await voip_service.get_call(call_id)
        
        # Verify user is part of this call
        if call["caller_id"] != current_user["id"] and call["callee_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to send events to this call")
            
        # Send the event
        result = await voip_service.trigger_call_event(
            call_id,
            request.event_type,
            request.data
        )
        
        return {"success": True}
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error sending call event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/voip/calls/{call_id}/analyze")
async def analyze_call(
    call_id: str,
    current_user = Depends(get_current_user)
):
    """Analyze a call with ML models."""
    try:
        # Get call first to verify ownership
        call = await voip_service.get_call(call_id)
        
        # Verify user is part of this call
        if call["caller_id"] != current_user["id"] and call["callee_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to analyze this call")
            
        # Analyze the call
        analysis = await voip_service.analyze_call(call_id)
        return analysis
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error analyzing call: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/voip/ws/{call_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    call_id: str
):
    """WebSocket endpoint for real-time VOIP communication."""
    try:
        await websocket.accept()
        
        # Get auth token
        auth_data = await websocket.receive_json()
        token = auth_data.get("token")
        
        if not token:
            await websocket.close(code=1008, reason="Authentication required")
            return
            
        # Verify token and get user
        try:
            user = await auth_manager.get_user_from_token(token)
        except Exception:
            await websocket.close(code=1008, reason="Invalid authentication")
            return
            
        # Get call
        try:
            call = await voip_service.get_call(call_id)
        except ValueError:
            await websocket.close(code=1008, reason="Call not found")
            return
            
        # Verify user is part of this call
        if call["caller_id"] != user["id"] and call["callee_id"] != user["id"]:
            await websocket.close(code=1008, reason="Not authorized for this call")
            return
            
        # Register event handler for this connection
        async def event_handler(call_id, event_type, data):
            try:
                await websocket.send_json({
                    "type": "event",
                    "event_type": event_type,
                    "data": data
                })
            except Exception as e:
                logger.error(f"Error sending event to websocket: {str(e)}")
                
        # Register audio handler for this connection
        async def audio_handler(call_id, transcription_result):
            try:
                await websocket.send_json({
                    "type": "transcription",
                    "data": transcription_result
                })
            except Exception as e:
                logger.error(f"Error sending transcription to websocket: {str(e)}")
                
        await voip_service.register_event_handler(call_id, event_handler)
        await voip_service.register_audio_handler(call_id, audio_handler)
        
        # Send connection success message
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "call_id": call_id,
            "user_id": user["id"]
        })
        
        # Process incoming audio data
        try:
            while True:
                # Get message type
                message = await websocket.receive_json()
                msg_type = message.get("type")
                
                if msg_type == "audio":
                    # Get binary audio data
                    audio_data = await websocket.receive_bytes()
                    
                    # Process audio data
                    speaker = "caller" if call["caller_id"] == user["id"] else "callee"
                    await voip_service.process_audio_chunk(call_id, audio_data, speaker)
                    
                elif msg_type == "event":
                    # Process event
                    event_type = message.get("event_type")
                    event_data = message.get("data", {})
                    
                    await voip_service.trigger_call_event(call_id, event_type, event_data)
                    
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected for call {call_id}, user {user['id']}")
            
    except Exception as e:
        logger.error(f"Error in WebSocket connection: {str(e)}")
        try:
            await websocket.close(code=1011, reason="Server error")
        except:
            pass 