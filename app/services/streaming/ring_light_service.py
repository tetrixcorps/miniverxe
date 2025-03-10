import asyncio
import logging
import time
import uuid
from typing import Dict, List, Any, Optional, Callable, AsyncGenerator
import json
import numpy as np
import torch
import holoscan
from holoscan.core import Application, Operator, Fragment, Condition
from holoscan.operators import FormatConverterOp, VideoStreamReplayerOp, VideoStreamRecorderOp, InferenceOp
from holoscan.resources import UnboundedAllocator
from pydantic import BaseModel
from app.core.config.auth_manager import AuthConfig
from app.services.storage.spaces_service import SpacesStorageService
from app.repositories.streaming_repository import StreamingRepository
from app.utils.websocket import WebSocketManager
from app.monitoring.metrics import STREAM_METRICS, CHAT_METRICS, ACTIVE_STREAMS
from app.observability.inference_tracer import InferenceTracer, TraceContext
from app.services.nlp.sentiment_analyzer import SentimentAnalysisService
from app.services.translation import TranslationService
from app.services.sip.sip_trunk_service import SIPTrunkService

logger = logging.getLogger(__name__)

class SIPTrunkConfig(BaseModel):
    """Configuration for SIP trunk connection."""
    trunk_id: str
    username: str
    password: str
    server: str
    port: int = 5060
    protocol: str = "UDP"
    timeout: int = 30

class ModeratorAction(BaseModel):
    """Action that a moderator can take on a stream."""
    action: str  # "mute", "pause", "ban", "warning", "resume"
    target_id: str  # User ID or stream ID
    reason: Optional[str] = None
    duration: Optional[int] = None  # Duration in seconds for temporary actions

class RingLightRoom(BaseModel):
    """Represents a streaming room."""
    room_id: str
    name: str
    owner_id: str
    is_public: bool = True
    max_participants: int = 100
    created_at: float = Field(default_factory=time.time)
    participants: Dict[str, Dict[str, Any]] = {}
    active_stream: Optional[str] = None
    chat_messages: List[Dict[str, Any]] = []
    moderators: List[str] = []
    stream_config: Dict[str, Any] = {}
    
class StreamStatus(BaseModel):
    """Status of a stream."""
    stream_id: str
    room_id: str
    streamer_id: str
    status: str  # "initializing", "live", "paused", "ended"
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    viewer_count: int = 0
    max_viewers: int = 0
    total_views: int = 0
    
class RingLightFrameProcessor(Operator):
    """Custom frame processor for RingLight streams."""
    def __init__(self, fragment, *args, **kwargs):
        self.sample_rate = kwargs.pop("sample_rate", 1)
        self.frame_count = 0
        super().__init__(fragment, *args, **kwargs)
        
    def setup(self, spec):
        self.register_input("input")
        self.register_output("output")
    
    def compute(self, op_input, op_output, context):
        frame = op_input.receive("input")
        self.frame_count += 1
        
        # Only process every Nth frame
        if self.frame_count % self.sample_rate == 0:
            # Here you could add effects, watermarks, etc.
            op_output.emit(frame, "output")

class RingLightApplication(Application):
    """Holoscan application for RingLight streaming."""
    def __init__(self, stream_id: str, config: Dict[str, Any]):
        super().__init__()
        self.stream_id = stream_id
        self.config = config
        self.operators = {}
        
    def compose(self):
        # Create video source operator
        self.operators["video_source"] = VideoStreamReplayerOp(
            self,
            name="video_source",
            directory=self.config.get("source_directory", "streams"),
            basename=self.stream_id,
            loop=self.config.get("loop", False)
        )
        
        # Create format converter
        self.operators["format_converter"] = FormatConverterOp(
            self,
            name="format_converter",
            pool=UnboundedAllocator(self, name="pool")
        )
        
        # Create custom frame processor
        self.operators["frame_processor"] = RingLightFrameProcessor(
            self,
            name="frame_processor",
            sample_rate=self.config.get("sample_rate", 2)
        )
        
        # Create recorder if needed
        if self.config.get("record", False):
            self.operators["recorder"] = VideoStreamRecorderOp(
                self,
                name="recorder",
                directory=self.config.get("recording_directory", "recordings"),
                basename=f"{self.stream_id}_recording"
            )
        
        # Connect operators
        self.add_flow(self.operators["video_source"], self.operators["format_converter"])
        self.add_flow(self.operators["format_converter"], self.operators["frame_processor"])
        
        # Add recorder to flow if enabled
        if self.config.get("record", False):
            self.add_flow(self.operators["frame_processor"], self.operators["recorder"])

class SIPTrunkManager:
    """Manages SIP trunk connections for moderator actions."""
    def __init__(self, config: SIPTrunkConfig):
        self.config = config
        self.active_calls: Dict[str, Any] = {}
        self.registered = False
        
    async def register(self):
        """Register with the SIP trunk server."""
        logger.info(f"Registering with SIP trunk server: {self.config.server}")
        # In a real implementation, this would use a SIP library
        # For now, we'll just simulate the registration
        await asyncio.sleep(1)
        self.registered = True
        logger.info("Successfully registered with SIP trunk server")
        return self.registered
        
    async def make_call(self, destination: str) -> str:
        """Make a SIP call to the specified destination."""
        if not self.registered:
            await self.register()
            
        call_id = str(uuid.uuid4())
        logger.info(f"Making SIP call to {destination}, call_id: {call_id}")
        # Simulate call setup
        await asyncio.sleep(0.5)
        self.active_calls[call_id] = {
            "destination": destination,
            "start_time": time.time(),
            "status": "connecting"
        }
        return call_id
        
    async def end_call(self, call_id: str):
        """End an active SIP call."""
        if call_id in self.active_calls:
            logger.info(f"Ending SIP call: {call_id}")
            # Simulate call teardown
            await asyncio.sleep(0.5)
            self.active_calls[call_id]["status"] = "ended"
            self.active_calls[call_id]["end_time"] = time.time()
        else:
            logger.warning(f"Attempted to end nonexistent call: {call_id}")
            
    async def send_dtmf(self, call_id: str, digits: str):
        """Send DTMF tones during an active call."""
        if call_id in self.active_calls and self.active_calls[call_id]["status"] == "connected":
            logger.info(f"Sending DTMF tones {digits} for call {call_id}")
            # Simulate sending DTMF
            await asyncio.sleep(0.1)
            return True
        return False

class RingLightService:
    """Service that manages RingLight rooms and streams."""
    def __init__(self, 
                 config: AuthConfig,
                 storage_service: Optional[SpacesStorageService] = None,
                 streaming_repository: Optional[StreamingRepository] = None,
                 translation_service: Optional[TranslationService] = None,
                 sentiment_service: Optional[SentimentAnalysisService] = None,
                 sip_service: Optional[SIPTrunkService] = None):
        
        self.config = config
        self.storage_service = storage_service or SpacesStorageService()
        self.streaming_repository = streaming_repository or StreamingRepository()
        self.translation_service = translation_service or TranslationService()
        self.sentiment_service = sentiment_service or SentimentAnalysisService()
        self.sip_service = sip_service or SIPTrunkService()
        
        # Initialize tracer
        self.tracer = InferenceTracer("ring_light_service")
        
        # Active streams and chatrooms
        self.active_streams = {}
        self.active_chatrooms = {}
        self.moderator_sessions = {}
        
        # Holoscan pipeline setup
        self.holoscan_config = self._load_holoscan_config()
        
        # Initialize metrics
        STREAM_METRICS.labels(type="nvidia_holoscan", status="initialized").inc()
        
        self.rooms: Dict[str, RingLightRoom] = {}
        self.streams: Dict[str, StreamStatus] = {}
        self.websockets: Dict[str, Dict[str, Any]] = {}  # room_id -> user_id -> websocket
        self.holoscan_apps: Dict[str, RingLightApplication] = {}
        self.sip_manager: Optional[SIPTrunkManager] = None
        
    def _load_holoscan_config(self) -> Dict[str, Any]:
        """Load Holoscan configuration"""
        # In production, this would load from a config file
        return {
            "gpu_id": 0,
            "input_format": "nv12",
            "output_format": "rgba",
            "resolution": {"width": 1280, "height": 720},
            "framerate": 30,
            "bitrate": 3000000,
            "codec": "h264_nvenc",
            "threads": 4,
            "buffer_size": 5,
            "low_latency": True
        }
    
    async def initialize_sip(self, config: SIPTrunkConfig):
        """Initialize the SIP trunk manager."""
        self.sip_manager = SIPTrunkManager(config)
        return await self.sip_manager.register()
    
    async def create_room(self, name: str, owner_id: str, is_public: bool = True, max_participants: int = 100) -> str:
        """Create a new RingLight room."""
        room_id = str(uuid.uuid4())
        room = RingLightRoom(
            room_id=room_id,
            name=name,
            owner_id=owner_id,
            is_public=is_public,
            max_participants=max_participants,
            moderators=[owner_id]  # Owner is automatically a moderator
        )
        self.rooms[room_id] = room
        logger.info(f"Created room {room_id} with name '{name}' owned by {owner_id}")
        return room_id
    
    async def delete_room(self, room_id: str, user_id: str) -> bool:
        """Delete a RingLight room."""
        if room_id not in self.rooms:
            return False
            
        room = self.rooms[room_id]
        if room.owner_id != user_id:
            logger.warning(f"User {user_id} attempted to delete room {room_id} but is not the owner")
            return False
            
        # Stop any active streams
        if room.active_stream and room.active_stream in self.streams:
            await self.stop_stream(room.active_stream, user_id)
            
        # Clean up websockets
        if room_id in self.websockets:
            for ws in self.websockets[room_id].values():
                try:
                    await ws.close(code=1000, reason="Room deleted")
                except Exception as e:
                    logger.error(f"Error closing websocket: {e}")
            del self.websockets[room_id]
            
        # Delete the room
        del self.rooms[room_id]
        logger.info(f"Deleted room {room_id}")
        return True
    
    async def join_room(self, room_id: str, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Join a RingLight room."""
        if room_id not in self.rooms:
            raise ValueError(f"Room {room_id} does not exist")
            
        room = self.rooms[room_id]
        
        # Check if room is full
        if len(room.participants) >= room.max_participants:
            raise ValueError(f"Room {room_id} is full")
            
        # Add user to participants
        room.participants[user_id] = {
            "user_id": user_id,
            "joined_at": time.time(),
            **user_data
        }
        
        logger.info(f"User {user_id} joined room {room_id}")
        
        # Return room state
        return {
            "room_id": room.room_id,
            "name": room.name,
            "owner_id": room.owner_id,
            "participants": list(room.participants.values()),
            "active_stream": room.active_stream,
            "is_moderator": user_id in room.moderators,
            "chat_messages": room.chat_messages[-50:]  # Last 50 messages
        }
    
    async def leave_room(self, room_id: str, user_id: str) -> bool:
        """Leave a RingLight room."""
        if room_id not in self.rooms or user_id not in self.rooms[room_id].participants:
            return False
            
        room = self.rooms[room_id]
        
        # Remove user from participants
        del room.participants[user_id]
        
        # If user was streaming, stop the stream
        if room.active_stream and self.streams.get(room.active_stream, {}).get("streamer_id") == user_id:
            await self.stop_stream(room.active_stream, user_id)
            
        # If room is now empty and isn't persistent, delete it
        if not room.participants and not room.is_public:
            await self.delete_room(room_id, room.owner_id)
            
        logger.info(f"User {user_id} left room {room_id}")
        return True
    
    async def start_stream(self, room_id: str, user_id: str, stream_config: Dict[str, Any]) -> str:
        """Start a new stream in a room."""
        if room_id not in self.rooms:
            raise ValueError(f"Room {room_id} does not exist")
            
        room = self.rooms[room_id]
        
        # Check if user is in the room
        if user_id not in room.participants:
            raise ValueError(f"User {user_id} is not in room {room_id}")
            
        # Check if there's already an active stream
        if room.active_stream:
            raise ValueError(f"Room {room_id} already has an active stream")
            
        # Create stream
        stream_id = str(uuid.uuid4())
        stream = StreamStatus(
            stream_id=stream_id,
            room_id=room_id,
            streamer_id=user_id,
            status="initializing"
        )
        self.streams[stream_id] = stream
        
        # Update room
        room.active_stream = stream_id
        room.stream_config = stream_config
        
        # Initialize Holoscan application
        try:
            app = RingLightApplication(stream_id, stream_config)
            self.holoscan_apps[stream_id] = app
            
            # Start application in a separate task
            asyncio.create_task(self._run_holoscan_app(stream_id, app))
            
            # Update stream status
            stream.status = "live"
            stream.start_time = time.time()
            
            logger.info(f"Started stream {stream_id} in room {room_id} by user {user_id}")
            
            # Broadcast stream start to all participants
            await self._broadcast_to_room(room_id, {
                "type": "stream_started",
                "stream_id": stream_id,
                "streamer_id": user_id,
                "timestamp": time.time()
            })
            
            return stream_id
            
        except Exception as e:
            logger.error(f"Error starting stream: {e}")
            
            # Clean up
            if stream_id in self.streams:
                del self.streams[stream_id]
            room.active_stream = None
            
            raise ValueError(f"Failed to start stream: {str(e)}")
        
    async def stop_stream(self, stream_id: str, user_id: str) -> bool:
        """Stop an active stream."""
        if stream_id not in self.streams:
            return False
            
        stream = self.streams[stream_id]
        
        # Check if user is authorized to stop the stream
        room = self.rooms.get(stream.room_id)
        if not room:
            return False
            
        if stream.streamer_id != user_id and user_id not in room.moderators:
            logger.warning(f"User {user_id} attempted to stop stream {stream_id} but is not authorized")
            return False
            
        # Update stream status
        stream.status = "ended"
        stream.end_time = time.time()
        
        # Stop Holoscan application
        if stream_id in self.holoscan_apps:
            # The application will be stopped by the _run_holoscan_app task
            pass
            
        # Update room
        room.active_stream = None
        
        logger.info(f"Stopped stream {stream_id}")
        
        # Broadcast stream end to all participants
        await self._broadcast_to_room(stream.room_id, {
            "type": "stream_ended",
            "stream_id": stream_id,
            "streamer_id": stream.streamer_id,
            "duration": stream.end_time - (stream.start_time or stream.end_time),
            "timestamp": time.time()
        })
        
        return True
        
    async def send_chat_message(self, room_id: str, user_id: str, message: str) -> Dict[str, Any]:
        """Send a chat message to a room."""
        if room_id not in self.rooms:
            raise ValueError(f"Room {room_id} does not exist")
            
        room = self.rooms[room_id]
        
        # Check if user is in the room
        if user_id not in room.participants:
            raise ValueError(f"User {user_id} is not in room {room_id}")
            
        # Create message
        msg_id = str(uuid.uuid4())
        msg = {
            "id": msg_id,
            "room_id": room_id,
            "sender_id": user_id,
            "sender_name": room.participants[user_id].get("name", "Anonymous"),
            "content": message,
            "timestamp": time.time()
        }
        
        # Add to room messages
        room.chat_messages.append(msg)
        
        # Trim messages if needed
        if len(room.chat_messages) > 1000:
            room.chat_messages = room.chat_messages[-1000:]
            
        # Broadcast message to all participants
        await self._broadcast_to_room(room_id, {
            "type": "chat_message",
            **msg
        })
        
        return msg
        
    async def register_websocket(self, room_id: str, user_id: str, websocket) -> bool:
        """Register a websocket connection for a user in a room."""
        if room_id not in self.rooms:
            return False
            
        if room_id not in self.websockets:
            self.websockets[room_id] = {}
            
        self.websockets[room_id][user_id] = websocket
        return True
        
    async def unregister_websocket(self, room_id: str, user_id: str) -> bool:
        """Unregister a websocket connection."""
        if room_id not in self.websockets or user_id not in self.websockets[room_id]:
            return False
            
        del self.websockets[room_id][user_id]
        
        # Clean up room entry if empty
        if not self.websockets[room_id]:
            del self.websockets[room_id]
            
        # Auto-leave the room
        await self.leave_room(room_id, user_id)
        
        return True
        
    async def add_moderator(self, room_id: str, moderator_id: str, target_id: str) -> bool:
        """Add a moderator to a room."""
        if room_id not in self.rooms:
            return False
            
        room = self.rooms[room_id]
        
        # Check if user is authorized
        if moderator_id != room.owner_id and moderator_id not in room.moderators:
            return False
            
        # Add target as moderator
        if target_id not in room.moderators:
            room.moderators.append(target_id)
            
            # Notify room
            await self._broadcast_to_room(room_id, {
                "type": "moderator_added",
                "room_id": room_id,
                "moderator_id": target_id,
                "added_by": moderator_id,
                "timestamp": time.time()
            })
            
        return True
        
    async def remove_moderator(self, room_id: str, moderator_id: str, target_id: str) -> bool:
        """Remove a moderator from a room."""
        if room_id not in self.rooms:
            return False
            
        room = self.rooms[room_id]
        
        # Owner can't be removed as moderator
        if target_id == room.owner_id:
            return False
            
        # Check if user is authorized
        if moderator_id != room.owner_id and moderator_id not in room.moderators:
            return False
            
        # Remove target as moderator
        if target_id in room.moderators:
            room.moderators.remove(target_id)
            
            # Notify room
            await self._broadcast_to_room(room_id, {
                "type": "moderator_removed",
                "room_id": room_id,
                "moderator_id": target_id,
                "removed_by": moderator_id,
                "timestamp": time.time()
            })
            
        return True
        
    async def moderator_action(self, room_id: str, moderator_id: str, action: str, target_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform a moderator action."""
        if room_id not in self.rooms:
            raise ValueError(f"Room {room_id} does not exist")
            
        room = self.rooms[room_id]
        
        # Check if user is a moderator
        if moderator_id not in room.moderators and moderator_id != room.owner_id:
            raise ValueError(f"User {moderator_id} is not a moderator in room {room_id}")
            
        target_id = target_data.get("target_id")
        
        if action == "kick":
            # Remove user from room
            if target_id not in room.participants:
                raise ValueError(f"User {target_id} is not in room {room_id}")
                
            # Send notification to target
            if room_id in self.websockets and target_id in self.websockets[room_id]:
                await self.websockets[room_id][target_id].send_json({
                    "type": "kicked",
                    "room_id": room_id,
                    "moderator_id": moderator_id,
                    "timestamp": time.time(),
                    "message": target_data.get("message", "You have been kicked from the room")
                })
                
            # Remove user
            await self.leave_room(room_id, target_id)
            
            # Notify room
            await self._broadcast_to_room(room_id, {
                "type": "user_kicked",
                "room_id": room_id,
                "user_id": target_id,
                "moderator_id": moderator_id,
                "timestamp": time.time(),
                "message": target_data.get("message", "User was kicked from the room")
            })
            
            return {"status": "success", "action": "kick"}
            
        elif action == "ban":
            # Not implemented in this example
            # Would require persistent storage for ban lists
            return {"status": "error", "message": "Ban action not implemented"}
            
        elif action == "mute":
            # Not implemented in this example
            # Would require additional state to track muted users
            return {"status": "error", "message": "Mute action not implemented"}
            
        elif action == "pause_stream":
            # Pause the active stream if present
            if not room.active_stream:
                raise ValueError("No active stream to pause")
                
            stream = self.streams.get(room.active_stream)
            if not stream:
                raise ValueError("Stream not found")
                
            stream.status = "paused"
            
            # Notify room
            await self._broadcast_to_room(room_id, {
                "type": "stream_paused",
                "room_id": room_id,
                "stream_id": room.active_stream,
                "moderator_id": moderator_id,
                "timestamp": time.time(),
                "message": target_data.get("message", "Stream paused by moderator")
            })
            
            return {"status": "success", "action": "pause_stream"}
            
        else:
            raise ValueError(f"Unknown moderation action: {action}")
        
    async def _broadcast_to_room(self, room_id: str, message: Dict[str, Any]):
        """Broadcast a message to all websockets in a room."""
        if room_id not in self.websockets:
            return
            
        tasks = []
        for user_id, websocket in self.websockets[room_id].items():
            try:
                tasks.append(websocket.send_json(message))
            except Exception as e:
                logger.error(f"Error sending to websocket for user {user_id}: {e}")
                
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
            
    async def _run_holoscan_app(self, stream_id: str, app: RingLightApplication):
        """Run a Holoscan application in a separate task."""
        try:
            logger.info(f"Starting Holoscan application for stream {stream_id}")
            # In a real implementation, this would run the Holoscan app
            # For now, we'll just simulate it
            await asyncio.sleep(1)  # Simulate startup
            
            # Update stream status if it still exists
            if stream_id in self.streams:
                self.streams[stream_id].status = "live"
            
            # Simulate running for a while
            app_running = True
            while app_running and stream_id in self.streams:
                # Check if stream should be stopped
                if self.streams[stream_id].status == "ended":
                    app_running = False
                await asyncio.sleep(1)
                
            logger.info(f"Stopping Holoscan application for stream {stream_id}")
            # Simulate shutdown
            await asyncio.sleep(1)
            
        except Exception as e:
            logger.error(f"Error in Holoscan application for stream {stream_id}: {e}")
        finally:
            # Clean up
            if stream_id in self.holoscan_apps:
                del self.holoscan_apps[stream_id] 