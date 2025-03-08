from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

# Add this to your existing content.py file
class TranslatedVideo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    tiktok_video_id: str
    original_title: str
    original_author: str
    original_language: str
    target_language: str
    original_text: str
    translated_text: str
    cover_image_url: Optional[str] = None
    share_url: Optional[str] = None
    subtitle_path: Optional[str] = None
    audio_translation_path: Optional[str] = None
    status: str = "COMPLETED"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow) 