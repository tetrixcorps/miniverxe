from typing import Dict, Any, Optional
import torch
import logging
from app.services.triton_client import TritonModelService
from app.services.asr import RivaASRService
from app.services.translation import NeMoTranslationService
from app.services.synthetic_data.nvidia_recon_generator import ReconSyntheticDataGenerator
from app.services.vision.tao_vision_analyzer import TAOVisionAnalyzer

logger = logging.getLogger(__name__)

class NGCModelOrchestrator:
    """Orchestrator that uses NVIDIA NGC optimized models"""
    
    def __init__(self):
        # Initialize services for different tasks
        self.triton_service = TritonModelService()
        self.asr_service = RivaASRService()
        self.translation_service = NeMoTranslationService()
        self.vision_analyzer = TAOVisionAnalyzer()
        self.synthetic_data_generator = ReconSyntheticDataGenerator()
        
        # Track available models on Triton
        self.available_models = self._get_available_models()
        
    def _get_available_models(self) -> Dict[str, Dict[str, Any]]:
        """Get available models from Triton server"""
        try:
            model_repository = self.triton_service.client.get_model_repository_index()
            
            models = {}
            for model_info in model_repository:
                models[model_info['name']] = {
                    'version': model_info['version'],
                    'state': model_info['state']
                }
                
            return models
        except Exception as e:
            logger.error(f"Failed to get model repository: {e}")
            return {}
            
    async def process_audio(self, audio_data: bytes, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Process audio with NVIDIA Riva ASR and NeMo translation"""
        # Determine language settings
        source_lang = metadata.get("source_lang", "eng")
        target_lang = metadata.get("target_lang", "eng")
        
        # Transcribe audio using Riva
        transcription = await self.asr_service.transcribe(
            audio_data, 
            language_code=self._map_language_code(source_lang)
        )
        
        # Translate if needed
        if source_lang != target_lang:
            translated = await self.translation_service.translate(
                transcription,
                source_lang=source_lang,
                target_lang=target_lang
            )
        else:
            translated = transcription
            
        return {
            "transcription": transcription,
            "translation": translated,
            "source_language": source_lang,
            "target_language": target_lang
        }
        
    async def process_image(self, image_data: bytes, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Process image with TAO vision models"""
        analysis = await self.vision_analyzer.analyze_image(image_data)
        
        return {
            "analysis": analysis,
            "metadata": metadata
        }
        
    async def generate_synthetic_data(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate synthetic data with NVIDIA RECON"""
        domain = config.get("domain", "general")
        count = config.get("count", 100)
        
        synthetic_data = await self.synthetic_data_generator.generate_synthetic_dataset(
            domain=domain,
            count=count
        )
        
        return synthetic_data
        
    def _map_language_code(self, lang_code: str) -> str:
        """Map internal language codes to Riva language codes"""
        mapping = {
            "eng": "en-US",
            "fra": "fr-FR",
            "deu": "de-DE",
            "spa": "es-ES",
            # Add more mappings as needed
        }
        return mapping.get(lang_code, "en-US") 