import logging
import asyncio
import time
from typing import Dict, List, Any, Optional, AsyncGenerator
import torch
from app.monitoring.metrics import CONVERSATION_METRICS
from app.services.translation import TranslationService
from app.services.asr import RivaASRService
from app.services.cache.model_cache import ModelCache
from app.core.config.auth_manager import AuthConfig
from app.observability.inference_tracer import InferenceTracer, TraceContext
from app.services.conversation.nvidia_model_adapter import NvidiaModelAdapter

logger = logging.getLogger(__name__)

class ConversationService:
    """Service for handling conversational AI interactions."""
    
    def __init__(self, 
                 auth_config: Optional[AuthConfig] = None,
                 translation_service: Optional[TranslationService] = None,
                 asr_service: Optional[RivaASRService] = None):
        """Initialize the conversation service."""
        self.auth_config = auth_config or AuthConfig()
        self.model_cache = ModelCache()
        self.tracer = InferenceTracer("conversation_service")
        
        # Services
        self.translation_service = translation_service or TranslationService()
        self.asr_service = asr_service or RivaASRService()
        
        # Initialize the model adapter
        try:
            self.model_adapter = NvidiaModelAdapter(self.auth_config)
            self.model_name = self.model_adapter.model_name
            logger.info(f"Initialized conversation service with model: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to initialize NVIDIA model adapter: {e}")
            raise
        
    def _load_model(self):
        """Load the conversation model."""
        try:
            # First check if model is in cache
            model_info = self.model_cache.get_model(self.model_name)
            if model_info:
                self.model = model_info["model"]
                self.tokenizer = model_info["tokenizer"]
                logger.info(f"Loaded conversation model {self.model_name} from cache")
                return
                
            # If not in cache, load from NGC or Hugging Face
            from transformers import AutoModelForCausalLM, AutoTokenizer
            
            # For NVIDIA NGC models, use custom loading logic
            if self.model_name.startswith("nvidia/"):
                from app.services.ngc_orchestrator import NGC_MODEL_MAP
                model_id = self.model_name.split("/")[1]
                if model_id in NGC_MODEL_MAP:
                    model_path = NGC_MODEL_MAP[model_id]["path"]
                    # Set appropriate quantization for faster inference with less memory
                    quantization_config = None
                    if torch.cuda.is_available():
                        from transformers import BitsAndBytesConfig
                        quantization_config = BitsAndBytesConfig(
                            load_in_8bit=True,
                            bnb_4bit_compute_dtype=torch.float16
                        )
                    
                    self.tokenizer = AutoTokenizer.from_pretrained(model_path)
                    self.model = AutoModelForCausalLM.from_pretrained(
                        model_path,
                        device_map="auto",
                        torch_dtype=torch.float16,
                        quantization_config=quantization_config
                    )
                else:
                    # Fall back to Hugging Face model
                    self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
                    self.model = AutoModelForCausalLM.from_pretrained(
                        self.model_name, 
                        device_map="auto",
                        torch_dtype=torch.float16
                    )
            else:
                # Standard Hugging Face model loading
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name, 
                    device_map="auto",
                    torch_dtype=torch.float16
                )
            
            # Cache the model for future use
            self.model_cache.store_model(
                self.model_name, 
                {"model": self.model, "tokenizer": self.tokenizer}
            )
            
            logger.info(f"Loaded conversation model {self.model_name}")
        except Exception as e:
            logger.error(f"Error loading conversation model: {e}")
            raise
    
    async def process_input(self, 
                           text: str, 
                           conversation_history: Optional[List[Dict[str, str]]] = None,
                           source_lang: Optional[str] = None,
                           target_lang: Optional[str] = "eng",
                           metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process text input and generate a response."""
        if not conversation_history:
            conversation_history = []
            
        start_time = time.time()
        trace_context = TraceContext()
        
        try:
            with self.tracer.start_span("conversation_processing", trace_context):
                # Detect language if not provided
                if not source_lang:
                    with self.tracer.start_span("language_detection", trace_context):
                        source_lang = await self.translation_service.detect_language(text)
                
                # Translate input to English if not already in English
                input_text = text
                if source_lang and source_lang != "eng":
                    with self.tracer.start_span("input_translation", trace_context):
                        input_text = await self.translation_service.translate_text(
                            text, 
                            source_lang=source_lang, 
                            target_lang="eng"
                        )
                
                # Generate response using model adapter
                with self.tracer.start_span("response_generation", trace_context):
                    response_text = await self.model_adapter.generate_response(
                        input_text,
                        conversation_history,
                        trace_context
                    )
                
                # Translate response back to target language if needed
                output_text = response_text
                if target_lang and target_lang != "eng":
                    with self.tracer.start_span("output_translation", trace_context):
                        output_text = await self.translation_service.translate_text(
                            response_text,
                            source_lang="eng",
                            target_lang=target_lang
                        )
                
                # Record successful metrics
                CONVERSATION_METRICS.labels(
                    model=self.model_name,
                    success="true"
                ).observe(time.time() - start_time)
                
                return {
                    "response": output_text,
                    "original_response": response_text if target_lang != "eng" else None,
                    "detected_language": source_lang,
                    "processing_time": time.time() - start_time
                }
                
        except Exception as e:
            logger.error(f"Error processing conversation input: {e}")
            
            # Record error metrics
            CONVERSATION_METRICS.labels(
                model=self.model_name,
                success="false"
            ).observe(time.time() - start_time)
            
            raise
    
    async def stream_response(self,
                             text: str,
                             conversation_history: Optional[List[Dict[str, str]]] = None,
                             source_lang: Optional[str] = None,
                             target_lang: Optional[str] = "eng",
                             metadata: Optional[Dict[str, Any]] = None) -> AsyncGenerator[str, None]:
        """Stream a response token by token."""
        if not conversation_history:
            conversation_history = []
        
        start_time = time.time()
        trace_context = TraceContext()
        
        try:
            # Detect language if not provided
            if not source_lang:
                source_lang = await self.translation_service.detect_language(text)
            
            # Translate input to English if needed
            input_text = text
            if source_lang and source_lang != "eng":
                input_text = await self.translation_service.translate_text(
                    text,
                    source_lang=source_lang,
                    target_lang="eng"
                )
            
            # If target language is English, we can stream directly
            if target_lang == "eng":
                async for token in self.model_adapter.stream_response(
                    input_text,
                    conversation_history,
                    trace_context
                ):
                    yield token
            else:
                # For non-English targets, we need to buffer and translate
                # Start by getting the full English response
                buffer = ""
                async for token in self.model_adapter.stream_response(
                    input_text,
                    conversation_history,
                    trace_context
                ):
                    buffer += token
                    
                    # Translate in chunks when we have enough text
                    # This is a simplistic approach - in production you might
                    # want to translate at sentence boundaries
                    if len(buffer) > 50 and (buffer.endswith('.') or buffer.endswith('?') or buffer.endswith('!')):
                        translated = await self.translation_service.translate_text(
                            buffer,
                            source_lang="eng",
                            target_lang=target_lang
                        )
                        yield translated
                        buffer = ""
                
                # Translate any remaining text
                if buffer:
                    translated = await self.translation_service.translate_text(
                        buffer,
                        source_lang="eng",
                        target_lang=target_lang
                    )
                    yield translated
            
            # Record metrics
            CONVERSATION_METRICS.labels(
                model=self.model_name,
                success="true"
            ).observe(time.time() - start_time)
        
        except Exception as e:
            logger.error(f"Error streaming conversation response: {e}")
            
            # Record error metrics
            CONVERSATION_METRICS.labels(
                model=self.model_name,
                success="false"
            ).observe(time.time() - start_time)
            
            raise
    
    async def process_audio_input(self,
                               audio_data: bytes,
                               conversation_history: Optional[List[Dict[str, str]]] = None,
                               source_lang: Optional[str] = None,
                               target_lang: Optional[str] = "eng",
                               metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process audio input and return a text response."""
        try:
            # Transcribe audio
            transcription = await self.asr_service.transcribe(audio_data, source_lang)
            
            # Process the transcribed text
            response = await self.process_input(
                transcription,
                conversation_history,
                source_lang,
                target_lang,
                metadata
            )
            
            # Add the transcription to the response
            response["transcription"] = transcription
            
            return response
        except Exception as e:
            logger.error(f"Error processing audio input: {e}")
            raise
    
    async def get_text_to_speech(self, text: str, language: str = "en-US") -> bytes:
        """Convert text to speech using Riva TTS."""
        # This would integrate with your existing TTS service
        # For now, this is a placeholder
        # In a real implementation, you would call your TTS service
        try:
            # Assume a RivaTTSService exists similar to RivaASRService
            from app.services.tts import RivaTTSService
            tts_service = RivaTTSService()
            
            # Map internal language code to Riva language code
            riva_language = self._map_language_code(language)
            
            # Generate speech
            audio_data = await tts_service.synthesize(text, riva_language)
            
            return audio_data
        except Exception as e:
            logger.error(f"Error in text-to-speech conversion: {e}")
            raise
    
    def _map_language_code(self, lang_code: str) -> str:
        """Map internal language codes to Riva language codes."""
        mapping = {
            "eng": "en-US",
            "fra": "fr-FR",
            "deu": "de-DE",
            "spa": "es-ES",
            # Add more mappings as needed
        }
        return mapping.get(lang_code, "en-US") 