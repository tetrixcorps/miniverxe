from fastapi import APIRouter, Depends, HTTPException, Body, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from typing import Dict, List, Any, Optional
import json
import asyncio
import logging
from app.services.conversation.conversation_service import ConversationService
from app.core.metrics import CONVERSATION_METRICS, CONVERSATION_REQUESTS
from app.core.config.auth_manager import get_current_user, get_api_key

router = APIRouter(prefix="/conversation")
logger = logging.getLogger(__name__)

conversation_service = ConversationService()

@router.post("/chat")
async def chat(
    request: Dict[str, Any] = Body(...),
    current_user = Depends(get_current_user)
):
    """Process a chat message and return a response."""
    try:
        # Extract parameters from request
        text = request.get("text", "")
        conversation_history = request.get("conversation_history", [])
        source_lang = request.get("source_lang")
        target_lang = request.get("target_lang", "eng")
        metadata = request.get("metadata", {})
        
        # Increment request counter
        CONVERSATION_REQUESTS.labels(
            model=conversation_service.model_name,
            language=source_lang or "unknown",
            streaming="false"
        ).inc()
        
        # Process the conversation
        response = await conversation_service.process_input(
            text,
            conversation_history,
            source_lang,
            target_lang,
            metadata
        )
        
        return response
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stream")
async def stream_chat(
    request: Dict[str, Any] = Body(...),
    current_user = Depends(get_current_user)
):
    """Stream a chat response."""
    try:
        # Extract parameters from request
        text = request.get("text", "")
        conversation_history = request.get("conversation_history", [])
        source_lang = request.get("source_lang")
        target_lang = request.get("target_lang", "eng")
        metadata = request.get("metadata", {})
        
        # Increment request counter
        CONVERSATION_REQUESTS.labels(
            model=conversation_service.model_name,
            language=source_lang or "unknown",
            streaming="true"
        ).inc()
        
        # Create async generator for streaming response
        async def response_generator():
            async for token in conversation_service.stream_response(
                text,
                conversation_history,
                source_lang,
                target_lang,
                metadata
            ):
                yield f"data: {json.dumps({'token': token})}\n\n"
        
        return StreamingResponse(
            response_generator(),
            media_type="text/event-stream"
        )
    except Exception as e:
        logger.error(f"Error in stream chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/audio")
async def process_audio(
    audio_file: UploadFile = File(...),
    source_lang: Optional[str] = None,
    target_lang: str = "eng",
    current_user = Depends(get_current_user)
):
    """Process audio input and return a text response."""
    try:
        # Read audio file
        audio_data = await audio_file.read()
        
        # Process audio
        response = await conversation_service.process_audio_input(
            audio_data,
            [],  # Empty conversation history
            source_lang,
            target_lang,
            {}  # No metadata
        )
        
        return response
    except Exception as e:
        logger.error(f"Error in process audio endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/text-to-speech")
async def text_to_speech(
    request: Dict[str, Any] = Body(...),
    current_user = Depends(get_current_user)
):
    """Convert text to speech."""
    try:
        text = request.get("text", "")
        language = request.get("language", "en-US")
        
        audio_data = await conversation_service.get_text_to_speech(text, language)
        
        return StreamingResponse(
            iter([audio_data]),
            media_type="audio/wav"
        )
    except Exception as e:
        logger.error(f"Error in text-to-speech endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time conversation."""
    await websocket.accept()
    
    try:
        while True:
            # Receive and parse message
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Extract parameters
            text = message.get("text", "")
            conversation_history = message.get("conversation_history", [])
            source_lang = message.get("source_lang")
            target_lang = message.get("target_lang", "eng")
            metadata = message.get("metadata", {})
            stream = message.get("stream", True)
            
            # Increment request counter
            CONVERSATION_REQUESTS.labels(
                model=conversation_service.model_name,
                language=source_lang or "unknown",
                streaming=str(stream).lower()
            ).inc()
            
            if stream:
                # Stream response
                async for token in conversation_service.stream_response(
                    text,
                    conversation_history,
                    source_lang,
                    target_lang,
                    metadata
                ):
                    await websocket.send_json({
                        "type": "token",
                        "content": token
                    })
                    
                # Send message completion signal
                await websocket.send_json({
                    "type": "complete"
                })
            else:
                # Send complete response
                response = await conversation_service.process_input(
                    text,
                    conversation_history,
                    source_lang,
                    target_lang,
                    metadata
                )
                
                await websocket.send_json({
                    "type": "response",
                    "content": response
                })
    
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"Error in WebSocket: {e}")
        await websocket.send_json({
            "type": "error",
            "content": str(e)
        }) 