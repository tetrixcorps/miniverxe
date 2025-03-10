from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Body
from typing import Dict, List, Any, Optional
import logging
import json
from app.services.streaming.ring_light_service import RingLightService
from app.core.config.auth_manager import get_current_user
from app.models.user import User
from app.monitoring.metrics import CHAT_METRICS, STREAM_METRICS

router = APIRouter(prefix="/ringlight")
ring_light_service = RingLightService()
logger = logging.getLogger(__name__)

@router.post("/rooms")
async def create_room(
    room_name: str = Body(...),
    is_public: bool = Body(True),
    max_participants: int = Body(100),
    current_user: User = Depends(get_current_user)
):
    """Create a new RingLight room."""
    try:
        room = await ring_light_service.create_room(
            owner_id=current_user.id,
            name=room_name,
            is_public=is_public,
            max_participants=max_participants
        )
        return {
            "status": "success",
            "room_id": room.room_id
        }
    except Exception as e:
        logger.error(f"Error creating room: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rooms")
async def list_rooms(
    current_user: User = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0
):
    """List available RingLight rooms."""
    try:
        rooms = await ring_light_service.list_rooms(
            user_id=current_user.id,
            limit=limit,
            offset=offset
        )
        return {
            "status": "success",
            "rooms": rooms
        }
    except Exception as e:
        logger.error(f"Error listing rooms: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rooms/{room_id}")
async def get_room(
    room_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get details for a specific room."""
    try:
        room = await ring_light_service.get_room(
            room_id=room_id,
            user_id=current_user.id
        )
        return {
            "status": "success",
            "room": room
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting room: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/rooms/{room_id}")
async def delete_room(
    room_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a room."""
    try:
        success = await ring_light_service.delete_room(
            room_id=room_id,
            user_id=current_user.id
        )
        return {
            "status": "success",
            "deleted": success
        }
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting room: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rooms/{room_id}/moderators")
async def add_moderator(
    room_id: str,
    user_id: str = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Add a moderator to a room."""
    try:
        success = await ring_light_service.add_moderator(
            room_id=room_id,
            moderator_id=user_id,
            owner_id=current_user.id
        )
        return {
            "status": "success",
            "added": success
        }
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        logger.error(f"Error adding moderator: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/rooms/{room_id}/moderators/{moderator_id}")
async def remove_moderator(
    room_id: str,
    moderator_id: str,
    current_user: User = Depends(get_current_user)
):
    """Remove a moderator from a room."""
    try:
        success = await ring_light_service.remove_moderator(
            room_id=room_id,
            moderator_id=moderator_id,
            owner_id=current_user.id
        )
        return {
            "status": "success",
            "removed": success
        }
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        logger.error(f"Error removing moderator: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/rooms/{room_id}/ws")
async def room_websocket(
    websocket: WebSocket,
    room_id: str
):
    """WebSocket endpoint for room communication."""
    await websocket.accept()
    
    user_id = None
    
    try:
        # First message should be authentication
        auth_message = await websocket.receive_json()
        
        if auth_message.get("type") != "authenticate":
            await websocket.send_json({
                "type": "error",
                "message": "First message must be authentication"
            })
            await websocket.close()
            return
        
        # In a real implementation, verify the token
        # For now, we'll just use the user_id from the message
        user_id = auth_message.get("user_id")
        
        if not user_id:
            await websocket.send_json({
                "type": "error",
                "message": "Authentication failed"
            })
            await websocket.close()
            return
        
        # Register the websocket
        await ring_light_service.register_websocket(room_id, user_id, websocket)
        
        # Send initial room state
        room_state = await ring_light_service.get_room_state(room_id, user_id)
        await websocket.send_json({
            "type": "room_state",
            **room_state
        })
        
        # Process messages
        async for message in websocket.iter_json():
            message_type = message.get("type")
            
            if message_type == "chat_message":
                await ring_light_service.send_chat_message(
                    room_id=room_id,
                    user_id=user_id,
                    message=message.get("content", "")
                )
            elif message_type == "start_stream":
                await ring_light_service.start_stream(
                    room_id=room_id,
                    user_id=user_id,
                    stream_config=message.get("stream_config", {})
                )
            elif message_type == "stop_stream":
                await ring_light_service.stop_stream(
                    room_id=room_id,
                    user_id=user_id,
                    stream_id=message.get("stream_id")
                )
            elif message_type == "join_room":
                await ring_light_service.update_participant(
                    room_id=room_id,
                    user_id=user_id,
                    user_data=message.get("user_data", {})
                )
            elif message_type == "leave_room":
                await ring_light_service.leave_room(
                    room_id=room_id,
                    user_id=user_id
                )
            elif message_type == "moderator_action":
                if message.get("action") and message.get("target_data"):
                    await ring_light_service.handle_moderator_action(
                        room_id=room_id,
                        moderator_id=user_id,
                        action=message["action"],
                        target_data=message["target_data"]
                    )
            elif message_type == "sip_moderation":
                action = message.get("action")
                if action == "start_call":
                    await ring_light_service.start_sip_moderation(
                        room_id=room_id,
                        moderator_id=user_id
                    )
                elif action == "end_call":
                    await ring_light_service.end_sip_moderation(
                        room_id=room_id,
                        moderator_id=user_id
                    )
            elif message_type == "heartbeat":
                # Respond to heartbeat
                await websocket.send_json({"type": "heartbeat_ack"})
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: room={room_id}, user={user_id}")
    except Exception as e:
        logger.error(f"Error in WebSocket: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass
    finally:
        # Clean up when the websocket is closed
        if user_id:
            await ring_light_service.unregister_websocket(room_id, user_id) 