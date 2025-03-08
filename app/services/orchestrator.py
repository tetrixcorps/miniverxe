from typing import Dict, Any, Optional
from app.models.base import BaseModel
from app.models.general import GeneralPurposeModel
from app.models.visual import VisualQAModel
from app.models.domain import DomainSpecificModel
from app.services.asr import ASRService
from app.services.translation import TranslationService
from app.models.domain import BankingLLMModel, MedicalLLMModel, GeneralLLMModel
from app.models.visual import Pix2StructModel
from app.models.general import MiniCPMModel
from app.services.synthetic_data.generator import SyntheticDataGenerator
from app.repositories.synthetic_data_repository import SyntheticDataRepository
from app.services.cache.model_cache import ModelCache
import logging
import time
import asyncio

logger = logging.getLogger(__name__)

class ModelOrchestrator:
    def __init__(self):
        self.general_model = MiniCPMModel()
        self.visual_model = Pix2StructModel()
        self.domain_models = {
            'banking': BankingLLMModel(),
            'medical': MedicalLLMModel(),
            'general': GeneralLLMModel()
        }
        self.asr_service = ASRService()
        self.translation_service = TranslationService()
        self.synthetic_data_repository = SyntheticDataRepository()
        self.model_cache = ModelCache()

    def _analyze_request(self, metadata: Dict[str, Any]) -> BaseModel:
        """
        Analyze request metadata to determine the appropriate model
        """
        # Check domain specificity
        if metadata.get("domain") and metadata.get("confidence_threshold", 0) > 0.8:
            return self.domain_models[metadata['domain']]
            
        # Check modality
        if metadata.get("modality") == "image":
            return self.visual_model
            
        # Default to general purpose model
        return self.general_model

    async def process_with_language(self, 
                                  content: str, 
                                  metadata: Dict[str, Any],
                                  target_lang: Optional[str] = None) -> Dict[str, Any]:
        """Process request with language handling"""
        try:
            # Detect source language if not specified
            source_lang = metadata.get("source_lang")
            if not source_lang:
                source_lang = await self.translation_service.detect_language(content)
                metadata["source_lang"] = source_lang

            # Translate input to English for model processing if needed
            if source_lang != "eng":
                content = await self.translation_service.translate(content, target_lang="eng", source_lang=source_lang)

            # Process with appropriate model
            model = self._analyze_request(metadata)
            response = await model.process(content, metadata)

            # Translate response if needed
            if target_lang and target_lang != "eng":
                response["text"] = await self.translation_service.translate(
                    response["text"],
                    target_lang=target_lang,
                    source_lang="eng"
                )
                response["language"] = target_lang

            return response

        except Exception as e:
            logger.error(f"Language processing failed: {e}")
            return {
                "text": "An error occurred during language processing.",
                "error": str(e),
                "language": "eng"
            }

    async def process_text(self, content: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Process text input with caching for offline resilience"""
        model_name = metadata.get("model", "general")
        domain = metadata.get("domain")
        confidence_threshold = metadata.get("confidence_threshold", 0.5)
        
        # Check cache first
        cached_result = await self.model_cache.get(
            model_type="text", 
            model_name=model_name,
            input_data=content,
            params={"domain": domain, "threshold": confidence_threshold}
        )
        
        if cached_result:
            logger.info(f"Cache hit for text processing: {model_name}")
            return cached_result
            
        # Cache miss, process the request
        try:
            # Select model based on domain
            model = self._analyze_request(metadata)
            
            # Process the text
            start_time = time.time()
            result = await model.process_text(content, confidence_threshold)
            processing_time = time.time() - start_time
            
            # Cache the result for future use
            confidence = result.get("confidence", 1.0)
            await self.model_cache.set(
                model_type="text",
                model_name=model_name,
                input_data=content,
                result=result,
                confidence=confidence,
                params={"domain": domain, "threshold": confidence_threshold}
            )
            
            # Return the processed result
            return result
            
        except Exception as e:
            logger.error(f"Error processing text: {e}")
            raise

    async def process_image(self, image_data: bytes, metadata: Dict[str, Any]):
        model = self._analyze_request(metadata)
        return await model.process(image_data, metadata)

    async def process_audio(self, audio_data: bytes, metadata: Dict[str, Any]):
        # Handle audio input
        transcription = await self.asr_service.transcribe(audio_data)
        translated_text = await self.translation_service.translate(transcription)
        return await self.process_text(translated_text, metadata)

    async def get_training_data_for_domain(self, domain: str, limit: int = 1000) -> Dict[str, Any]:
        """Get synthetic training data for a specific domain"""
        # Query synthetic data repository for domain-specific synthetic data
        query = {"config.conversations.domains": domain}
        datasets = await self.synthetic_data_repository.list_datasets(query)
        
        training_data = {
            "conversations": [],
            "speech_samples": []
        }
        
        # Limit the amount of data we retrieve
        dataset_count = 0
        for dataset_metadata in datasets:
            if dataset_count >= 10:  # Limit to 10 datasets
                break
                
            dataset = await self.synthetic_data_repository.get_dataset(dataset_metadata["dataset_id"])
            
            # Add conversations and speech samples from this dataset
            training_data["conversations"].extend(dataset["data"]["conversations"])
            training_data["speech_samples"].extend(dataset["data"]["speech_samples"])
            
            dataset_count += 1
            
            # Check if we have enough data
            if (len(training_data["conversations"]) >= limit or 
                len(training_data["speech_samples"]) >= limit//10):
                break
                
        return training_data
        
    async def generate_domain_specific_data(self, domain: str, count: int = 10) -> str:
        """Generate domain-specific synthetic data for model training"""
        generator = SyntheticDataGenerator()
        
        config = {
            "conversations": {
                "count": count,
                "messages_per_conversation": 10,
                "languages": ["eng", "fra", "swh", "yor"],
                "domains": [domain]
            },
            "speech_samples": {
                "count": count // 2,
                "languages": ["eng", "fra", "swh", "yor"],
                "noise_level": 0.05
            },
            "apply_augmentation": True,
            "augmentation_methods": ["typos", "word_substitution", "dialect_variation"],
            "augmentation_rate": 0.3
        }
        
        data = await generator.generate_bulk_data(config)
        data_id = await self.synthetic_data_repository.store_synthetic_data(data, config, {"passed": True})
        
        return data_id 