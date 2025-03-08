from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.orchestrator import ModelOrchestrator
from app.models.request import ProcessRequest
from app.api.content import video_upload_routes
from app.api.integrations import google_drive_routes
from app.api.user import integration_routes
from app.api import synthetic_data_routes
from app.services.service_manager import ServiceManager
from app.api.routes import background

router = APIRouter()
orchestrator = ModelOrchestrator()
service_manager = ServiceManager()

# Include the routers
router.include_router(video_upload_routes.router)
router.include_router(google_drive_routes.router)
router.include_router(integration_routes.router)
router.include_router(synthetic_data_routes.router)
router.include_router(background.router)

@router.post("/process")
async def process_request(request: ProcessRequest):
    try:
        # Extract metadata and modality from request
        metadata = {
            "modality": request.modality,
            "domain": request.domain,
            "confidence_threshold": request.confidence_threshold
        }
        
        # Route to appropriate handler based on modality
        if request.modality == "text":
            # Option 1: Process directly (synchronous)
            return await orchestrator.process_text(request.content, metadata)
            
            # Option 2: Process in background (async) - uncomment to use this approach
            # task_id = await service_manager.enqueue_task(
            #     "text_processing", 
            #     {"content": request.content, "metadata": metadata}
            # )
            # return {"status": "processing", "task_id": task_id}
            
        elif request.modality == "image":
            return await orchestrator.process_image(request.content, metadata)
        elif request.modality == "audio":
            return await orchestrator.process_audio(request.content, metadata)
        else:
            raise HTTPException(status_code=400, detail="Unsupported modality")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 