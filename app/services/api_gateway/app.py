from fastapi import FastAPI, HTTPException
from app.services.translation import TranslationService
from app.services.model_optimizer import ModelOptimizer, OptimizationConfig
from app.observability.tracing_config import setup_tracing
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="ML Translation Service")

# Setup services
translation_service = TranslationService()
model_optimizer = ModelOptimizer(
    OptimizationConfig(
        pruning_method="magnitude",
        target_sparsity=0.3
    )
)

# Setup tracing
setup_tracing()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        # Warm up model cache
        await translation_service.initialize()
        logger.info("Translation service initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/translate")
async def translate_text(
    text: str,
    target_lang: str,
    source_lang: str = None,
    optimize: bool = False
):
    """Translate text endpoint"""
    try:
        if optimize:
            # Use optimized model
            translation = await translation_service.translate_with_optimization(
                text,
                target_lang,
                source_lang
            )
        else:
            # Use standard model
            translation = await translation_service.translate(
                text,
                target_lang,
                source_lang
            )
        
        return {"translation": translation}
    
    except Exception as e:
        logger.error(f"Translation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize_model")
async def optimize_model():
    """Optimize the translation model"""
    try:
        await translation_service.optimize_translation_model()
        return {"status": "success", "message": "Model optimization complete"}
    except Exception as e:
        logger.error(f"Model optimization failed: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 