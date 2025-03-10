import asyncio
import logging
import time
import uuid
from typing import Dict, List, Any, Optional
import json
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class SIPConfig(BaseModel):
    """Configuration for SIP trunk connection."""
    trunk_id: str
    username: str
    password: str
    server: str
    port: int = 5060
    protocol: str = "UDP"
    timeout: int = 30

class SIPCallStatus(BaseModel):
    """Status of a SIP call."""
    call_id: str
    room_id: str
    user_id: str
    status: str  # "initializing", "active", "ended"
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    duration: int = 0

class SIPTrunkService:
    """Service for handling SIP trunk communications for moderation."""
    
    def __init__(self):
        self.active_calls: Dict[str, SIPCallStatus] = {}
        self.call_handlers: Dict[str, asyncio.Task] = {}
        self.sip_configs: Dict[str, SIPConfig] = {}
        
    async def initialize(self, config: Dict[str, Any]):
        """Initialize the SIP trunk service with configuration."""
        try:
            if "sip_trunks" in config:
                for trunk_id, trunk_config in config["sip_trunks"].items():
                    self.sip_configs[trunk_id] = SIPConfig(
                        trunk_id=trunk_id,
                        **trunk_config
                    )
            logger.info(f"SIP Trunk Service initialized with {len(self.sip_configs)} trunks")
        except Exception as e:
            logger.error(f"Failed to initialize SIP Trunk Service: {e}")
            
    async def start_call(self, room_id: str, user_id: str, trunk_id: Optional[str] = None) -> str:
        """Start a SIP call for moderation."""
        if not trunk_id and self.sip_configs:
            # Use the first available trunk if none specified
            trunk_id = next(iter(self.sip_configs))
            
        if not trunk_id or trunk_id not in self.sip_configs:
            raise ValueError("No valid SIP trunk configuration available")
            
        call_id = str(uuid.uuid4())
        
        # Create call status
        call_status = SIPCallStatus(
            call_id=call_id,
            room_id=room_id,
            user_id=user_id,
            status="initializing"
        )
        
        self.active_calls[call_id] = call_status
        
        # Start call handler task
        task = asyncio.create_task(self._handle_call(call_id, self.sip_configs[trunk_id]))
        self.call_handlers[call_id] = task
        
        return call_id
        
    async def end_call(self, call_id: str) -> bool:
        """End an active SIP call."""
        if call_id not in self.active_calls:
            logger.warning(f"Attempted to end non-existent call: {call_id}")
            return False
            
        call = self.active_calls[call_id]
        call.status = "ended"
        call.end_time = time.time()
        
        if call.start_time:
            call.duration = int(call.end_time - call.start_time)
            
        # Cancel the call handler task
        if call_id in self.call_handlers:
            self.call_handlers[call_id].cancel()
            try:
                await self.call_handlers[call_id]
            except asyncio.CancelledError:
                pass
            del self.call_handlers[call_id]
            
        return True
        
    async def get_call_status(self, call_id: str) -> Optional[Dict[str, Any]]:
        """Get the status of a call."""
        if call_id not in self.active_calls:
            return None
            
        call = self.active_calls[call_id]
        return call.dict()
        
    async def list_active_calls(self, room_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all active calls, optionally filtered by room_id."""
        calls = []
        
        for call in self.active_calls.values():
            if call.status == "active" and (not room_id or call.room_id == room_id):
                calls.append(call.dict())
                
        return calls
        
    async def _handle_call(self, call_id: str, config: SIPConfig):
        """Handle an active SIP call."""
        try:
            logger.info(f"Starting SIP call: {call_id}")
            
            # In a real implementation, this would establish the SIP connection
            # For this example, we'll just simulate the call
            
            # Update call status to active
            if call_id in self.active_calls:
                self.active_calls[call_id].status = "active"
                self.active_calls[call_id].start_time = time.time()
            
            # Keep the call active until it's ended
            while call_id in self.active_calls and self.active_calls[call_id].status == "active":
                await asyncio.sleep(1)
                
            logger.info(f"SIP call ended: {call_id}")
            
        except asyncio.CancelledError:
            logger.info(f"SIP call cancelled: {call_id}")
            raise
        except Exception as e:
            logger.error(f"Error in SIP call {call_id}: {e}")
            
            # Update call status if it still exists
            if call_id in self.active_calls:
                self.active_calls[call_id].status = "ended"
                self.active_calls[call_id].end_time = time.time()
    
    async def create_session(self, 
                           session_id: str, 
                           user_id: str, 
                           stream_id: str, 
                           is_moderator: bool = False) -> Dict[str, Any]:
        """Create a new SIP session"""
        # Generate SIP credentials
        username = f"user_{user_id}_{int(time.time())}"
        password = self._generate_sip_password()
        sip_uri = f"sip:{username}@{self.base_sip_domain}"
        
        # Store session info
        self.active_sessions[session_id] = {
            "user_id": user_id,
            "stream_id": stream_id,
            "username": username,
            "password": password,
            "sip_uri": sip_uri,
            "created_at": time.time(),
            "is_moderator": is_moderator,
            "status": "created"
        }
        
        logger.info(f"Created SIP session {session_id} for user {user_id}")
        
        return {
            "session_id": session_id,
            "username": username,
            "password": password,
            "sip_uri": sip_uri,
            "server": self.sip_server,
            "wss_url": self.wss_endpoint
        }
    
    def _generate_sip_password(self) -> str:
        """Generate a secure password for SIP authentication"""
        import random
        import string
        chars = string.ascii_letters + string.digits
        return ''.join(random.choice(chars) for _ in range(16))
    
    async def activate_session(self, session_id: str) -> Dict[str, Any]:
        """Activate a SIP session"""
        if session_id not in self.active_sessions:
            raise ValueError(f"SIP session {session_id} not found")
        
        session = self.active_sessions[session_id]
        session["status"] = "active"
        session["activated_at"] = time.time()
        
        logger.info(f"Activated SIP session {session_id}")
        
        return {
            "status": "active",
            "session_id": session_id,
            "sip_uri": session["sip_uri"]
        }
    
    async def terminate_session(self, session_id: str) -> Dict[str, Any]:
        """Terminate a SIP session"""
        if session_id not in self.active_sessions:
            return {"status": "success"}  # Already terminated or doesn't exist
        
        session = self.active_sessions[session_id]
        session["status"] = "terminated"
        session["terminated_at"] = time.time()
        
        logger.info(f"Terminated SIP session {session_id}")
        
        return {"status": "success"}
    
    async def send_dtmf(self, session_id: str, digits: str) -> Dict[str, Any]:
        """Send DTMF tones to the SIP session"""
        if session_id not in self.active_sessions:
            raise ValueError(f"SIP session {session_id} not found")
            
        session = self.active_sessions[session_id]
        if session["status"] != "active":
            raise ValueError(f"SIP session {session_id} is not active")
            
        logger.info(f"Sending DTMF {digits} to SIP session {session_id}")
        
        # In a real implementation, this would actually send DTMF tones
        # to the SIP session
        
        return {
            "status": "success",
            "digits": digits
        }
    
    async def get_session_info(self, session_id: str) -> Dict[str, Any]:
        """Get SIP session information"""
        if session_id not in self.active_sessions:
            raise ValueError(f"SIP session {session_id} not found")
            
        session = self.active_sessions[session_id]
        
        return {
            "session_id": session_id,
            "user_id": session["user_id"],
            "stream_id": session["stream_id"],
            "sip_uri": session["sip_uri"],
            "status": session["status"],
            "created_at": session["created_at"],
            "is_moderator": session["is_moderator"]
        } 