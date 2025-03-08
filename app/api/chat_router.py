from fastapi import WebSocket, Depends
from fastapi.websockets import WebSocketDisconnect
from app.services.chat import ChatManager
from app.services.translation import TranslationService
from app.repositories.chat import ChatRepository

router = APIRouter()

@router.websocket("/ws/chat/{room_id}")
async def chat_websocket(
    websocket: WebSocket, 
    room_id: str,
    current_user = Depends(get_current_user)
):
    await chat_manager.connect(websocket, room_id, current_user)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Handle different message types
            if data["type"] == "chat_message":
                # Process message with language detection
                detected_lang = await translation_service.detect_language(data["message"])
                
                # Store message in original language
                message_id = await chat_repository.store_message(
                    room_id=room_id,
                    user_id=current_user.id,
                    message=data["message"],
                    language=detected_lang
                )
                
                # Broadcast to all users in the room with appropriate translations
                await chat_manager.broadcast_message(
                    room_id=room_id,
                    message=data["message"],
                    source_lang=detected_lang,
                    sender=current_user,
                    message_id=message_id
                )
    except WebSocketDisconnect:
        await chat_manager.disconnect(websocket, room_id, current_user) 