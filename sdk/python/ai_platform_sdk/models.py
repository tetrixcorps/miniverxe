"""Data models for the AI-Enhanced Microservices Platform SDK."""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional, Union


@dataclass
class TranscriptionOptions:
    """Options for audio transcription."""
    
    language: str = "en-US"
    model: str = "general"
    punctuate: bool = True
    diarize: bool = False
    speaker_count: Optional[int] = None
    profanity_filter: bool = False
    boost_words: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class MediaEnhancementOptions:
    """Options for media enhancement."""
    
    scale: float = 2.0
    denoise: bool = True
    quality: str = "high"  # high, medium, low
    preserve_colors: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


@dataclass
class VisionAnalysisOptions:
    """Options for vision analysis."""
    
    features: List[str] = field(default_factory=lambda: ["objects", "faces", "text"])
    min_confidence: float = 0.5
    max_results: int = 100
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


@dataclass
class CallOptions:
    """Options for VOIP calls."""
    
    callee_id: str
    enable_recording: bool = True
    enable_transcription: bool = True
    enable_analysis: bool = True
    callback_url: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class WebhookConfiguration:
    """Configuration for webhook integrations."""
    
    platform: str  # e.g., "mailchimp", "hubspot", "marketo"
    url: str
    events: List[str]
    secret: Optional[str] = None
    description: Optional[str] = None
    headers: Dict[str, str] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {k: v for k, v in asdict(self).items() if v is not None} 