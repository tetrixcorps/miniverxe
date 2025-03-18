from fastapi import APIRouter, HTTPException
from typing import List
from app.services.nlp.cosmos_tokenizer import CosmosTokenizer
from app.schemas.nlp import TokenizationRequest, TokenizationResponse

router = APIRouter()
tokenizer = CosmosTokenizer()

@router.post("/tokenize", response_model=TokenizationResponse)
async def tokenize_text(request: TokenizationRequest):
    """
    Tokenize input text using NVIDIA Cosmos tokenizer.
    """
    try:
        result = await tokenizer.tokenize(
            request.text,
            max_length=request.max_length,
            padding=request.padding,
            truncation=request.truncation
        )
        
        return TokenizationResponse(
            tokens=result["input_ids"].tolist(),
            attention_mask=result["attention_mask"].tolist()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch-tokenize")
async def batch_tokenize(request: List[TokenizationRequest]):
    """
    Tokenize multiple texts in a batch.
    """
    try:
        texts = [req.text for req in request]
        result = await tokenizer.batch_tokenize(
            texts,
            max_length=request[0].max_length,
            padding=request[0].padding,
            truncation=request[0].truncation
        )
        
        return {
            "tokens": result["input_ids"].tolist(),
            "attention_mask": result["attention_mask"].tolist()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 