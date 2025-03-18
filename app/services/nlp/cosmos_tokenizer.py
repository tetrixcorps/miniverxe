from typing import List, Dict, Any, Optional
import torch
from transformers import AutoTokenizer
from app.core.config.auth_manager import AuthConfigManager
from app.core.logger import CustomLogger
from app.core.exceptions import TokenizerError

class CosmosTokenizer:
    """
    NVIDIA Cosmos Tokenizer implementation for advanced NLP processing.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.logger = CustomLogger("cosmos_tokenizer")
        self.auth_manager = AuthConfigManager()
        self.config = config or {}
        
        # Initialize NGC credentials
        self.ngc_creds = self.auth_manager.get_nvidia_credentials()
        
        # Load tokenizer
        self.tokenizer = self._initialize_tokenizer()
        
    def _initialize_tokenizer(self):
        """Initialize the Cosmos tokenizer."""
        try:
            # Use NGC credentials to access the model
            model_path = "nvidia/cosmos-tokenizer"
            tokenizer = AutoTokenizer.from_pretrained(
                model_path,
                token=self.ngc_creds['api_key']
            )
            self.logger.info("Cosmos tokenizer initialized successfully")
            return tokenizer
        except Exception as e:
            raise TokenizerError(
                f"Failed to initialize Cosmos tokenizer: {str(e)}"
            )

    async def tokenize(
        self,
        text: str,
        max_length: int = 512,
        padding: bool = True,
        truncation: bool = True
    ) -> Dict[str, torch.Tensor]:
        """
        Tokenize input text using Cosmos tokenizer.
        
        Args:
            text: Input text to tokenize
            max_length: Maximum sequence length
            padding: Whether to pad sequences
            truncation: Whether to truncate sequences
            
        Returns:
            Dictionary containing tokenized outputs
        """
        try:
            encoded = self.tokenizer(
                text,
                max_length=max_length,
                padding=padding,
                truncation=truncation,
                return_tensors="pt"
            )
            
            return {
                "input_ids": encoded["input_ids"],
                "attention_mask": encoded["attention_mask"],
                "token_type_ids": encoded.get("token_type_ids"),
                "special_tokens_mask": encoded.get("special_tokens_mask")
            }
        except Exception as e:
            raise TokenizerError(
                f"Tokenization failed: {str(e)}"
            )

    async def batch_tokenize(
        self,
        texts: List[str],
        max_length: int = 512,
        padding: bool = True,
        truncation: bool = True
    ) -> Dict[str, torch.Tensor]:
        """
        Tokenize a batch of texts.
        
        Args:
            texts: List of input texts
            max_length: Maximum sequence length
            padding: Whether to pad sequences
            truncation: Whether to truncate sequences
            
        Returns:
            Dictionary containing batched tokenized outputs
        """
        try:
            encoded = self.tokenizer(
                texts,
                max_length=max_length,
                padding=padding,
                truncation=truncation,
                return_tensors="pt"
            )
            
            return {
                "input_ids": encoded["input_ids"],
                "attention_mask": encoded["attention_mask"],
                "token_type_ids": encoded.get("token_type_ids"),
                "special_tokens_mask": encoded.get("special_tokens_mask")
            }
        except Exception as e:
            raise TokenizerError(
                f"Batch tokenization failed: {str(e)}"
            )

    def decode(
        self,
        token_ids: torch.Tensor,
        skip_special_tokens: bool = True
    ) -> str:
        """
        Decode token IDs back to text.
        
        Args:
            token_ids: Tensor of token IDs
            skip_special_tokens: Whether to skip special tokens in output
            
        Returns:
            Decoded text
        """
        try:
            return self.tokenizer.decode(
                token_ids,
                skip_special_tokens=skip_special_tokens
            )
        except Exception as e:
            raise TokenizerError(
                f"Token decoding failed: {str(e)}"
            ) 