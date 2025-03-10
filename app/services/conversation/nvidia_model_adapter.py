import logging
import time
import asyncio
from typing import Dict, List, Any, Optional, AsyncGenerator
import torch
import numpy as np
import json
import os
from app.monitoring.metrics import CONVERSATION_TOKENS
from app.core.config.auth_manager import AuthConfig
from app.observability.inference_tracer import TraceContext

# Import NVIDIA Riva client
try:
    import nvidia_riva.client
    from nvidia_riva.client.audio import AudioEncoding
    from nvidia_riva.client.auth import RivaAuthToken
    from nvidia_riva.client import ChatHistory, ChatRequest, ChatModel
    RIVA_AVAILABLE = True
except ImportError:
    RIVA_AVAILABLE = False

# Import NeMo for fallback
try:
    import nemo
    import nemo.collections.nlp as nemo_nlp
    NEMO_AVAILABLE = True
except ImportError:
    NEMO_AVAILABLE = False

logger = logging.getLogger(__name__)

class NvidiaModelAdapter:
    """Adapter for NVIDIA models (Riva or NeMo) for conversational AI."""
    
    def __init__(self, auth_config: Optional[AuthConfig] = None):
        self.auth_config = auth_config or AuthConfig()
        self.model_type = "nvidia-riva"  # Default to Riva
        self.model_name = "riva-chat"
        
        # Load configurations
        self.riva_uri = self.auth_config.nvidia.riva_uri
        self.riva_auth_key = self.auth_config.nvidia.riva_auth_key
        self.nemo_model_path = self.auth_config.nvidia.nemo_model_path
        
        # Initialize clients
        self._init_clients()
        
    def _init_clients(self):
        """Initialize the appropriate clients based on availability."""
        self.riva_client = None
        self.nemo_model = None
        
        # Try Riva first
        if RIVA_AVAILABLE:
            try:
                if self.riva_auth_key:
                    auth = RivaAuthToken(self.riva_auth_key)
                    self.riva_client = nvidia_riva.client.RivaClient(
                        self.riva_uri,
                        auth=auth
                    )
                else:
                    self.riva_client = nvidia_riva.client.RivaClient(self.riva_uri)
                logger.info("Riva client initialized successfully")
                return
            except Exception as e:
                logger.warning(f"Failed to initialize Riva client: {e}. Falling back to NeMo.")
        
        # Fall back to NeMo if Riva is not available
        if NEMO_AVAILABLE:
            try:
                # Check if we have a specific model path
                if self.nemo_model_path and os.path.exists(self.nemo_model_path):
                    self.nemo_model = nemo_nlp.models.language_models.MegatronGPTModel.restore_from(self.nemo_model_path)
                else:
                    # Download a default model
                    self.nemo_model = nemo_nlp.models.language_models.MegatronGPTModel.from_pretrained("megatron_gpt_345m")
                self.model_type = "nemo"
                self.model_name = "megatron_gpt"
                logger.info("NeMo model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load NeMo model: {e}")
                raise RuntimeError("Failed to initialize any conversation model")
        else:
            logger.error("Neither Riva nor NeMo are available. Cannot initialize conversation model.")
            raise RuntimeError("No conversation model available")
    
    async def generate_response(self, 
                               text: str, 
                               conversation_history: List[Dict[str, str]],
                               trace_context: Optional[TraceContext] = None) -> str:
        """Generate a response to the user input."""
        start_time = time.time()
        
        # Track input tokens
        input_tokens = len(text.split())
        CONVERSATION_TOKENS.labels(model=self.model_name, direction="input").inc(input_tokens)
        
        try:
            # Try using Riva first if available
            if self.riva_client:
                try:
                    # Convert conversation history to Riva format
                    chat_history = ChatHistory()
                    for message in conversation_history:
                        if message["role"] == "user":
                            chat_history.add_user_message(message["content"])
                        else:
                            chat_history.add_assistant_message(message["content"])
                    
                    # Add current user message
                    chat_history.add_user_message(text)
                    
                    # Create request
                    request = ChatRequest(
                        messages=chat_history,
                        model=ChatModel.LLAMA2_70B,  # Use appropriate model
                        temperature=0.7,
                        top_p=0.9,
                        max_tokens=1024
                    )
                    
                    # Get response
                    response = self.riva_client.chat_sync(request)
                    assistant_message = response.message
                    
                    # Track output tokens
                    output_tokens = len(assistant_message.split())
                    CONVERSATION_TOKENS.labels(model=self.model_name, direction="output").inc(output_tokens)
                    
                    return assistant_message
                except Exception as e:
                    logger.warning(f"Riva chat failed: {e}. Falling back to NeMo.")
            
            # Fall back to NeMo
            if self.nemo_model:
                # Format conversation for NeMo
                prompt = self._format_conversation_for_nemo(text, conversation_history)
                
                # Generate response using NeMo model
                with torch.no_grad():
                    response = self.nemo_model.generate(
                        prompt=prompt,
                        max_length=200,
                        min_length=10,
                        temperature=0.8,
                        top_k=50,
                        top_p=0.9,
                        repetition_penalty=1.2,
                        num_return_sequences=1
                    )
                
                # Extract just the assistant's reply from the full generated text
                assistant_message = self._extract_assistant_message(response[0], prompt)
                
                # Track output tokens
                output_tokens = len(assistant_message.split())
                CONVERSATION_TOKENS.labels(model=self.model_name, direction="output").inc(output_tokens)
                
                return assistant_message
            
            raise RuntimeError("No conversation model available")
        
        finally:
            duration = time.time() - start_time
            logger.info(f"Response generation took {duration:.2f} seconds")
    
    async def stream_response(self, 
                             text: str, 
                             conversation_history: List[Dict[str, str]],
                             trace_context: Optional[TraceContext] = None) -> AsyncGenerator[str, None]:
        """Stream a response token by token."""
        start_time = time.time()
        
        # Track input tokens
        input_tokens = len(text.split())
        CONVERSATION_TOKENS.labels(model=self.model_name, direction="input").inc(input_tokens)
        
        try:
            # Try using Riva first if available
            if self.riva_client:
                try:
                    # Convert conversation history to Riva format
                    chat_history = ChatHistory()
                    for message in conversation_history:
                        if message["role"] == "user":
                            chat_history.add_user_message(message["content"])
                        else:
                            chat_history.add_assistant_message(message["content"])
                    
                    # Add current user message
                    chat_history.add_user_message(text)
                    
                    # Create request
                    request = ChatRequest(
                        messages=chat_history,
                        model=ChatModel.LLAMA2_70B,  # Use appropriate model
                        temperature=0.7,
                        top_p=0.9,
                        max_tokens=1024
                    )
                    
                    # Stream response
                    output_tokens = 0
                    for response in self.riva_client.chat_stream(request):
                        # Update token count
                        output_tokens += 1
                        
                        yield response.delta
                    
                    # Track total output tokens
                    CONVERSATION_TOKENS.labels(model=self.model_name, direction="output").inc(output_tokens)
                    return
                except Exception as e:
                    logger.warning(f"Riva streaming chat failed: {e}. Falling back to NeMo.")
            
            # Fall back to NeMo - note that true streaming might not be supported
            # so we'll fake it by generating the full response and then yielding tokens
            if self.nemo_model:
                # Format conversation for NeMo
                prompt = self._format_conversation_for_nemo(text, conversation_history)
                
                # Generate response using NeMo model
                with torch.no_grad():
                    response = self.nemo_model.generate(
                        prompt=prompt,
                        max_length=200,
                        min_length=10,
                        temperature=0.8,
                        top_k=50,
                        top_p=0.9,
                        repetition_penalty=1.2,
                        num_return_sequences=1
                    )
                
                # Extract just the assistant's reply
                assistant_message = self._extract_assistant_message(response[0], prompt)
                
                # Simulate streaming by yielding tokens one by one
                tokens = assistant_message.split()
                for token in tokens:
                    yield token + " "
                    await asyncio.sleep(0.05)  # Simulate realistic typing speed
                
                # Track output tokens
                CONVERSATION_TOKENS.labels(model=self.model_name, direction="output").inc(len(tokens))
                return
            
            raise RuntimeError("No conversation model available")
        
        finally:
            duration = time.time() - start_time
            logger.info(f"Streaming response generation took {duration:.2f} seconds")
    
    def _format_conversation_for_nemo(self, text: str, conversation_history: List[Dict[str, str]]) -> str:
        """Format the conversation history for NeMo model input."""
        formatted_prompt = ""
        
        # Add conversation history
        for message in conversation_history:
            if message["role"] == "user":
                formatted_prompt += f"User: {message['content']}\n"
            else:
                formatted_prompt += f"Assistant: {message['content']}\n"
        
        # Add current user message and assistant prompt
        formatted_prompt += f"User: {text}\nAssistant:"
        
        return formatted_prompt
    
    def _extract_assistant_message(self, full_response: str, prompt: str) -> str:
        """Extract just the assistant's reply from the full generated text."""
        # This is a simplistic approach and might need refinement for actual production
        try:
            # The assistant's response should come after the prompt
            if full_response.startswith(prompt):
                assistant_response = full_response[len(prompt):].strip()
                
                # If there's any further conversation (like if the model generated a new "User:" part)
                # we should cut it off
                if "User:" in assistant_response:
                    assistant_response = assistant_response.split("User:")[0].strip()
                
                return assistant_response
            else:
                # Fallback if the response format is unexpected
                return full_response.strip()
        except Exception as e:
            logger.error(f"Error extracting assistant message: {e}")
            return full_response.strip() 