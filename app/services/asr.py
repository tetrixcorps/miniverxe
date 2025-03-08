from transformers import WhisperProcessor, WhisperForConditionalGeneration
import torch
from typing import Optional
import nvidia_riva.client
from nvidia_riva.client.auth import RivaAuthToken
from app.config import settings

class ASRService:
    def __init__(self):
        self.processor = WhisperProcessor.from_pretrained("openai/whisper-large-v2")
        self.model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-large-v2")
        
    async def transcribe(self, audio_data: bytes) -> str:
        # Process audio and return transcription
        inputs = self.processor(audio_data, return_tensors="pt")
        generated_ids = self.model.generate(**inputs)
        transcription = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        return transcription 

class RivaASRService:
    def __init__(self):
        self.auth = RivaAuthToken(uri=settings.RIVA_SERVER_URL)
        self.client = nvidia_riva.client.RivaClient(auth=self.auth)
        
    async def transcribe(self, audio_data: bytes, language_code: str = "en-US") -> str:
        """Transcribe audio using NVIDIA Riva's high-performance ASR models"""
        response = self.client.recognize(
            audio_data,
            language_code=language_code,
            enable_automatic_punctuation=True,
            audio_encoding='LINEAR_PCM',
            sample_rate_hertz=16000,
            max_alternatives=1
        )
        
        return response.results[0].alternatives[0].transcript

class HybridASRService:
    """Service that can use both Whisper and Riva, with fallback capabilities"""
    def __init__(self):
        self.riva_service = RivaASRService()
        # Initialize the existing Whisper-based service as fallback
        from app.services.asr import ASRService
        self.whisper_service = ASRService()
        
    async def transcribe(self, audio_data: bytes, language_code: str = "en-US") -> str:
        try:
            # Try Riva first for better performance
            return await self.riva_service.transcribe(audio_data, language_code)
        except Exception as e:
            # Fall back to Whisper
            return await self.whisper_service.transcribe(audio_data) 