from pydantic import BaseModel
from typing import List, Optional

class TokenizationRequest(BaseModel):
    text: str
    max_length: int = 512
    padding: bool = True
    truncation: bool = True

class TokenizationResponse(BaseModel):
    tokens: List[List[int]]
    attention_mask: List[List[int]]
    token_type_ids: Optional[List[List[int]]] = None 