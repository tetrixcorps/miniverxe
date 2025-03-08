import logging
from typing import Dict, Tuple, Optional, Any
import torch
from transformers import AutoModel, AutoTokenizer, WhisperForConditionalGeneration, WhisperProcessor, AutoModelForSpeechSeq2Seq, AutoProcessor, SeamlessM4TModel, SeamlessM4TProcessor, AutoModelForCausalLM
from config.model_config import ModelSpecs
from config.paths import ModelPaths, MODEL_CACHE
import os
from pathlib import Path
from unsloth import FastLanguageModel
from utils.cache_manager import ModelCacheManager
from utils.gpu_monitor import GPUMonitor
import numpy as np
from prometheus_client import Counter, Histogram

# Import Nemo and Riva packages
try:
    from nemo.collections.asr.models import EncDecCTCModel, EncDecClassificationModel
    from nemo.collections.tts.models import FastPitchModel, HifiGanModel
    NEMO_AVAILABLE = True
except ImportError:
    NEMO_AVAILABLE = False
    
try:
    import riva.client
    from riva.client.auth import RivaAuthToken
    RIVA_AVAILABLE = True
except ImportError:
    RIVA_AVAILABLE = False

# Define metrics for model loading and inference
MODEL_LOAD_TIME = Histogram("model_load_time_seconds", "Time to load model", ["model_name", "backend"])
MODEL_LOAD_COUNT = Counter("model_load_total", "Number of models loaded", ["model_name", "backend", "status"])
INFERENCE_LATENCY = Histogram("model_inference_latency_seconds", "Model inference latency", ["model_name", "backend"])
INFERENCE_COUNT = Counter("model_inference_total", "Number of inference requests", ["model_name", "backend", "status"])

class ModelManager:
    def __init__(self, device: torch.device):
        self.device = device
        self.models: Dict[str, torch.nn.Module] = {}
        self.tokenizers: Dict[str, AutoTokenizer] = {}
        self.logger = logging.getLogger(__name__)
        
        # Create model directories
        ModelPaths.create_dirs()
        
        # Set environment variable for Hugging Face cache
        os.environ['TRANSFORMERS_CACHE'] = str(MODEL_CACHE)
        
        self.cache_manager = ModelCacheManager(
            cache_dir=Path("/app/model_cache")
        )
        
        self.gpu_monitor = GPUMonitor()
        self.gpu_monitor.start()
        
        # Initialize Riva client
        self.riva_client = None
        self.use_riva = False
        
        # Try to initialize Riva if available
        if RIVA_AVAILABLE:
            try:
                self.logger.info("Initializing Riva client")
                auth = riva.client.Auth(
                    uri=os.getenv("RIVA_API_URI", "localhost:50051"),
                    use_ssl=os.getenv("RIVA_USE_SSL", "false").lower() == "true"
                )
                self.riva_client = riva.client.RivaClient(auth)
                self.use_riva = True
                self.logger.info("Riva client initialized successfully")
            except Exception as e:
                self.logger.warning(f"Riva initialization failed: {e}. Will fall back to local models.")
        
    def check_device_requirements(self, specs: ModelSpecs) -> bool:
        """Check if device meets model requirements"""
        if self.device.type == 'cuda':
            vram = torch.cuda.get_device_properties(0).total_memory / 1024**3
            return vram >= specs.device_requirements['min_vram']
        return False
        
    def load_model(self, specs: ModelSpecs):
        try:
            # Check GPU memory availability
            memory_usage = self.gpu_monitor.get_memory_usage()
            if any(usage > 90 for usage in memory_usage.values()):
                self.logger.warning("High GPU memory usage detected")
            
            # Ensure model files are in cache
            if not self.cache_manager.get_model_files(specs.name):
                raise ValueError(f"Failed to load model files for {specs.name}")
            
            # Load model to GPU
            return self._load_to_gpu(specs)
            
        except Exception as e:
            self.logger.error(f"Error loading model: {str(e)}")
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="unknown", status="error").inc()
            return None, None
            
    def get_model(self, name: str) -> Tuple[Optional[torch.nn.Module], Optional[AutoTokenizer]]:
        """Get a loaded model and its tokenizer"""
        return self.models.get(name), self.tokenizers.get(name)
    
    def _get_model_path(self, model_name: str) -> Path:
        """Get the appropriate path for a model"""
        if 'pix2struct' in model_name:
            return ModelPaths.PIX2STRUCT
        elif 'minicpm' in model_name:
            return ModelPaths.MINICPM
        elif 'afro-tts' in model_name:
            return ModelPaths.AFRO_TTS
        elif 'whisper' in model_name:
            return ModelPaths.WHISPER
        else:
            return MODEL_CACHE 

    def load_banking_model(self, specs: ModelSpecs) -> Tuple[Optional[torch.nn.Module], Optional[AutoTokenizer]]:
        """Load banking-specific model"""
        try:
            self.logger.info(f"Loading banking model: {specs.name}")
            
            model_path = self._get_model_path(specs.name)
            
            model, tokenizer = FastLanguageModel.from_pretrained(
                model_name=specs.name,
                max_seq_length=specs.device_requirements['max_seq_length'],
                dtype=specs.device_requirements['dtype'],
                load_in_4bit=specs.device_requirements['load_in_4bit'],
                device_map="auto",
                cache_dir=model_path
            )
            
            self.models[specs.name] = model
            self.tokenizers[specs.name] = tokenizer
            
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="unsloth", status="success").inc()
            return model, tokenizer
            
        except Exception as e:
            self.logger.error(f"Failed to load banking model: {str(e)}")
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="unsloth", status="error").inc()
            return None, None 

    def load_asr_model(self, specs: ModelSpecs) -> Tuple[Optional[torch.nn.Module], Optional[Any]]:
        """Load ASR-specific model"""
        # Check if we should use NVIDIA stack
        if getattr(specs, 'use_nvidia_stack', False):
            if self.use_riva:
                self.logger.info(f"Using Riva for ASR: {specs.name}")
                # Return None for model since we'll use Riva client directly
                MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="riva", status="success").inc()
                return None, None
            elif NEMO_AVAILABLE:
                return self.load_nemo_asr_model(specs)
            else:
                self.logger.warning("NVIDIA stack requested but not available. Falling back to Whisper.")
        
        # Original implementation with Whisper
        try:
            self.logger.info(f"Loading ASR model: {specs.name}")
            import time
            start_time = time.time()
            
            model_path = self._get_model_path(specs.name)
            
            # Load model and processor
            model = WhisperForConditionalGeneration.from_pretrained(
                specs.name,
                cache_dir=model_path,
                torch_dtype=specs.device_requirements['dtype']
            ).to(self.device)
            
            processor = WhisperProcessor.from_pretrained(
                specs.name,
                cache_dir=model_path
            )
            
            self.models[specs.name] = model
            self.tokenizers[specs.name] = processor
            
            load_time = time.time() - start_time
            MODEL_LOAD_TIME.labels(model_name=specs.name, backend="whisper").observe(load_time)
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="whisper", status="success").inc()
            
            return model, processor
            
        except Exception as e:
            self.logger.error(f"Failed to load ASR model: {str(e)}")
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="whisper", status="error").inc()
            return None, None 

    def load_tts_model(self, specs: ModelSpecs) -> Tuple[Optional[torch.nn.Module], Optional[Any]]:
        """Load TTS-specific model"""
        # Check if we should use NVIDIA stack
        if getattr(specs, 'use_nvidia_stack', False):
            if self.use_riva:
                self.logger.info(f"Using Riva for TTS: {specs.name}")
                # Return None for model since we'll use Riva client directly
                MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="riva", status="success").inc()
                return None, None
            elif NEMO_AVAILABLE:
                return self.load_nemo_tts_model(specs)
            else:
                self.logger.warning("NVIDIA stack requested but not available. Falling back to standard TTS.")
        
        # Original implementation with AutoModelForSpeechSeq2Seq
        try:
            self.logger.info(f"Loading TTS model: {specs.name}")
            import time
            start_time = time.time()
            
            model_path = self._get_model_path(specs.name)
            
            # Load model and processor
            model = AutoModelForSpeechSeq2Seq.from_pretrained(
                specs.name,
                cache_dir=model_path,
                torch_dtype=specs.device_requirements['dtype']
            ).to(self.device)
            
            processor = AutoProcessor.from_pretrained(
                specs.name,
                cache_dir=model_path
            )
            
            self.models[specs.name] = model
            self.tokenizers[specs.name] = processor
            
            load_time = time.time() - start_time
            MODEL_LOAD_TIME.labels(model_name=specs.name, backend="huggingface").observe(load_time)
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="huggingface", status="success").inc()
            
            return model, processor
            
        except Exception as e:
            self.logger.error(f"Failed to load TTS model: {str(e)}")
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="huggingface", status="error").inc()
            return None, None
    
    def load_nemo_asr_model(self, specs: ModelSpecs) -> Tuple[Optional[EncDecCTCModel], None]:
        """Load Nemo ASR model"""
        if not NEMO_AVAILABLE:
            self.logger.error("Cannot load Nemo ASR model: Nemo not available")
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="nemo", status="error").inc()
            return None, None
            
        try:
            self.logger.info(f"Loading Nemo ASR model: {specs.name}")
            import time
            start_time = time.time()
            
            # Load pretrained model from NGC
            model = EncDecCTCModel.from_pretrained(
                model_name=specs.name,
                map_location=self.device
            )
            
            self.models[f"nemo_{specs.name}"] = model
            # No separate tokenizer needed for Nemo models
            
            load_time = time.time() - start_time
            MODEL_LOAD_TIME.labels(model_name=specs.name, backend="nemo").observe(load_time)
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="nemo", status="success").inc()
            
            return model, None
            
        except Exception as e:
            self.logger.error(f"Failed to load Nemo ASR model: {str(e)}")
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="nemo", status="error").inc()
            return None, None

    def load_nemo_tts_model(self, specs: ModelSpecs) -> Tuple[Optional[FastPitchModel], Optional[HifiGanModel]]:
        """Load Nemo TTS models (FastPitch + HifiGan)"""
        if not NEMO_AVAILABLE:
            self.logger.error("Cannot load Nemo TTS model: Nemo not available")
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="nemo", status="error").inc()
            return None, None
            
        try:
            self.logger.info(f"Loading Nemo TTS models: {specs.name}")
            import time
            start_time = time.time()
            
            fastpitch_name = getattr(specs, 'fastpitch_name', None)
            hifigan_name = getattr(specs, 'hifigan_name', None)
            
            if not fastpitch_name or not hifigan_name:
                raise ValueError("Nemo TTS requires both fastpitch_name and hifigan_name to be specified")
            
            # Load FastPitch model for mel-spectrogram generation
            fastpitch = FastPitchModel.from_pretrained(
                model_name=fastpitch_name,
                map_location=self.device
            )
            
            # Load HifiGan vocoder
            vocoder = HifiGanModel.from_pretrained(
                model_name=hifigan_name,
                map_location=self.device
            )
            
            self.models[f"nemo_fastpitch_{specs.name}"] = fastpitch
            self.models[f"nemo_vocoder_{specs.name}"] = vocoder
            
            load_time = time.time() - start_time
            MODEL_LOAD_TIME.labels(model_name=specs.name, backend="nemo").observe(load_time)
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="nemo", status="success").inc()
            
            return fastpitch, vocoder
            
        except Exception as e:
            self.logger.error(f"Failed to load Nemo TTS models: {str(e)}")
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="nemo", status="error").inc()
            return None, None

    async def process_audio_riva(self, audio_data: bytes, language_code: str = "en-US", sample_rate: int = 16000) -> str:
        """Process audio using Riva if available"""
        if not self.use_riva or not self.riva_client:
            raise ValueError("Riva client not initialized")
            
        try:
            import time
            start_time = time.time()
            
            # Create recognition config
            config = riva.client.RecognitionConfig(
                encoding=riva.client.AudioEncoding.LINEAR_PCM,
                sample_rate_hertz=sample_rate,
                language_code=language_code,
                max_alternatives=1,
                enable_automatic_punctuation=True
            )
            
            # Process audio
            response = await self.riva_client.recognize(
                config=config,
                audio=audio_data
            )
            
            latency = time.time() - start_time
            INFERENCE_LATENCY.labels(model_name="riva_asr", backend="riva").observe(latency)
            INFERENCE_COUNT.labels(model_name="riva_asr", backend="riva", status="success").inc()
            
            return response.results[0].alternatives[0].transcript
            
        except Exception as e:
            self.logger.error(f"Riva processing failed: {str(e)}")
            INFERENCE_COUNT.labels(model_name="riva_asr", backend="riva", status="error").inc()
            raise

    async def synthesize_speech_riva(self, text: str, language_code: str = "en-US", voice_name: str = "english-us-female-1") -> bytes:
        """Synthesize speech using Riva if available"""
        if not self.use_riva or not self.riva_client:
            raise ValueError("Riva client not initialized")
            
        try:
            import time
            start_time = time.time()
            
            # Create synthesis request
            request = riva.client.SynthesizeSpeechRequest()
            request.text = text
            request.language_code = language_code
            request.encoding = riva.client.AudioEncoding.LINEAR_PCM
            request.sample_rate_hz = 24000
            request.voice_name = voice_name
            
            # Synthesize speech
            response = await self.riva_client.synthesize(request)
            
            latency = time.time() - start_time
            INFERENCE_LATENCY.labels(model_name="riva_tts", backend="riva").observe(latency)
            INFERENCE_COUNT.labels(model_name="riva_tts", backend="riva", status="success").inc()
            
            return response.audio
            
        except Exception as e:
            self.logger.error(f"Riva speech synthesis failed: {str(e)}")
            INFERENCE_COUNT.labels(model_name="riva_tts", backend="riva", status="error").inc()
            raise

    def load_translation_model(self, specs: ModelSpecs) -> Tuple[Optional[torch.nn.Module], Optional[AutoProcessor]]:
        """Load translation-specific model"""
        try:
            self.logger.info(f"Loading translation model: {specs.name}")
            import time
            start_time = time.time()
            
            model_path = self._get_model_path(specs.name)
            
            # Load model and processor
            model = SeamlessM4TModel.from_pretrained(
                specs.name,
                cache_dir=model_path,
                torch_dtype=specs.device_requirements['dtype']
            ).to(self.device)
            
            processor = SeamlessM4TProcessor.from_pretrained(
                specs.name,
                cache_dir=model_path
            )
            
            self.models[specs.name] = model
            self.tokenizers[specs.name] = processor
            
            load_time = time.time() - start_time
            MODEL_LOAD_TIME.labels(model_name=specs.name, backend="huggingface").observe(load_time)
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="huggingface", status="success").inc()
            
            return model, processor
            
        except Exception as e:
            self.logger.error(f"Failed to load translation model: {str(e)}")
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="huggingface", status="error").inc()
            return None, None 

    def load_dolphin_model(self, model_name: str = "cognitivecomputations/Dolphin3.0-Llama3.1-8B-GGUF") -> Tuple[Optional[torch.nn.Module], Optional[AutoTokenizer]]:
        """Load Dolphin 3.0 model"""
        try:
            self.logger.info(f"Loading Dolphin model: {model_name}")
            import time
            start_time = time.time()
            
            # Configure model loading
            model_config = {
                "device_map": "auto",
                "torch_dtype": torch.bfloat16,
                "load_in_8bit": True,
                "trust_remote_code": True
            }
            
            # Load model and tokenizer
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                **model_config
            )
            
            tokenizer = AutoTokenizer.from_pretrained(
                model_name,
                trust_remote_code=True
            )
            
            # Register the model
            self.models[model_name] = model
            self.tokenizers[model_name] = tokenizer
            
            load_time = time.time() - start_time
            MODEL_LOAD_TIME.labels(model_name=model_name, backend="huggingface").observe(load_time)
            MODEL_LOAD_COUNT.labels(model_name=model_name, backend="huggingface", status="success").inc()
            
            return model, tokenizer
            
        except Exception as e:
            self.logger.error(f"Failed to load Dolphin model: {str(e)}")
            MODEL_LOAD_COUNT.labels(model_name=model_name, backend="huggingface", status="error").inc()
            return None, None 

    def _load_to_gpu(self, specs: ModelSpecs) -> Tuple[Optional[torch.nn.Module], Optional[AutoTokenizer]]:
        """Load a model to GPU"""
        try:
            if not self.check_device_requirements(specs):
                raise ValueError(f"Insufficient VRAM for {specs.name}")
            
            # Ensure model files are in cache
            self.cache_manager.get_model_files(specs.name)
            
            # Determine model path
            model_path = self._get_model_path(specs.name)
            self.logger.info(f"Loading model from: {model_path}")
            
            import time
            start_time = time.time()
            
            # Download or load model
            model = AutoModel.from_pretrained(
                specs.name,
                cache_dir=model_path,
                trust_remote_code=specs.trust_remote_code,
                torch_dtype=specs.device_requirements['dtype']
            )
            
            model = model.eval().to(self.device)
            tokenizer = AutoTokenizer.from_pretrained(specs.name, trust_remote_code=True)
            
            # Special handling for TTS models
            if specs.type == 'tts' and hasattr(model, 'init_tts'):
                model.init_tts()
                model.tts.float()
            
            self.models[specs.name] = model
            self.tokenizers[specs.name] = tokenizer
            
            load_time = time.time() - start_time
            MODEL_LOAD_TIME.labels(model_name=specs.name, backend="huggingface").observe(load_time)
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="huggingface", status="success").inc()
            
            self.logger.info(f"Successfully loaded {specs.name}")
            return model, tokenizer
            
        except Exception as e:
            self.logger.error(f"Error loading {specs.name}: {str(e)}")
            MODEL_LOAD_COUNT.labels(model_name=specs.name, backend="huggingface", status="error").inc()
            return None, None 

    def __del__(self):
        if hasattr(self, 'gpu_monitor'):
            self.gpu_monitor.stop()