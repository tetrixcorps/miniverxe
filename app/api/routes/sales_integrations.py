from fastapi import APIRouter, Depends, HTTPException, Body, BackgroundTasks
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import json
from app.core.config.auth_manager import get_current_user, AuthManager
from app.services.marketing.campaign_analyzer import MarketingCampaignAnalyzer
from app.services.asr.riva_asr_service import RivaTranscriptionService
from app.services.vision.vision_service import VisionService
from app.api.routes.background import BackgroundTaskManager
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger("sales_integrations")
campaign_analyzer = MarketingCampaignAnalyzer()
transcription_service = RivaTranscriptionService()
vision_service = VisionService()
background_manager = BackgroundTaskManager()
auth_manager = AuthManager()

class SalesCallRequest(BaseModel):
    call_id: str
    recording_url: str
    opportunity_id: Optional[str] = None
    contact_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    callback_url: Optional[str] = None

class SalesCallResponse(BaseModel):
    success: bool
    task_id: str
    message: str

class SalesforceSyncRequest(BaseModel):
    opportunity_id: str
    update_fields: Dict[str, Any]
    account_id: Optional[str] = None
    
@router.post("/sales/analyze-call", response_model=SalesCallResponse)
async def analyze_sales_call(
    request: SalesCallRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """Analyze a sales call recording and update CRM."""
    try:
        # Create task for background processing
        task_metadata = {
            "call_id": request.call_id,
            "opportunity_id": request.opportunity_id,
            "contact_id": request.contact_id,
            "recording_url": request.recording_url,
            "user_id": current_user["id"],
            "callback_url": request.callback_url
        }
        
        task_id = await background_manager.create_task(
            "sales_call_analysis",
            task_metadata
        )
        
        # Schedule the background task
        background_tasks.add_task(
            process_sales_call,
            task_id,
            task_metadata
        )
        
        return SalesCallResponse(
            success=True,
            task_id=task_id,
            message="Sales call analysis scheduled"
        )
        
    except Exception as e:
        logger.error(f"Error scheduling sales call analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sales/salesforce/sync")
async def sync_with_salesforce(
    request: SalesforceSyncRequest,
    current_user = Depends(get_current_user)
):
    """Update Salesforce opportunity with ML analysis results."""
    try:
        # This would integrate with Salesforce API
        # Simplified for example
        logger.info(f"Syncing data to Salesforce opportunity {request.opportunity_id}")
        
        # This would be the actual Salesforce update
        result = {
            "success": True,
            "opportunity_id": request.opportunity_id,
            "updated_fields": list(request.update_fields.keys()),
            "timestamp": "2023-08-10T14:30:00Z"
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error syncing with Salesforce: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sales/hubspot/sync")
async def sync_with_hubspot(
    opportunity_id: str = Body(...),
    update_fields: Dict[str, Any] = Body(...),
    current_user = Depends(get_current_user)
):
    """Update HubSpot deal with ML analysis results."""
    try:
        # This would integrate with HubSpot API
        # Simplified for example
        logger.info(f"Syncing data to HubSpot deal {opportunity_id}")
        
        # This would be the actual HubSpot update
        result = {
            "success": True,
            "deal_id": opportunity_id,
            "updated_properties": list(update_fields.keys()),
            "timestamp": "2023-08-10T14:30:00Z"
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error syncing with HubSpot: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_sales_call(task_id: str, metadata: Dict[str, Any]):
    """Background process to analyze a sales call."""
    try:
        await background_manager.update_task_status(task_id, "processing", 10)
        
        # Download recording
        # In production, this would download from metadata["recording_url"]
        audio_content = b"AUDIO_CONTENT"  # Placeholder
        
        # Transcribe call
        await background_manager.update_task_status(task_id, "processing", 30, 
                                                  {"message": "Transcribing call"})
        
        transcription = await transcription_service.transcribe_file(
            audio_content,
            {
                "language": "en-US",
                "diarization": True,
                "speaker_count": 2
            }
        )
        
        # Analyze call content
        await background_manager.update_task_status(task_id, "processing", 60, 
                                                  {"message": "Analyzing content"})
        
        # This would use more sophisticated analysis in production
        call_analysis = {
            "transcription": transcription,
            "sentiment": {
                "overall": "positive",
                "customer": "interested",
                "rep": "confident"
            },
            "topics": ["pricing", "implementation", "support"],
            "action_items": [
                "Send product brochure",
                "Schedule technical demo next week"
            ],
            "next_steps": "schedule_demo",
            "lead_score": 85,
            "probability": 0.75
        }
        
        # Update CRM if opportunity_id is provided
        if metadata.get("opportunity_id"):
            await background_manager.update_task_status(task_id, "processing", 80, 
                                                      {"message": "Updating CRM"})
            
            # Determine CRM type and update
            # This would integrate with the actual CRM API
            crm_update_result = {
                "success": True,
                "system": "salesforce",
                "opportunity_id": metadata["opportunity_id"],
                "updated_fields": ["Stage", "Probability", "NextStep"]
            }
            
            call_analysis["crm_update"] = crm_update_result
        
        # Complete the task
        await background_manager.update_task_status(task_id, "completed", 100, call_analysis)
        
        # Send callback if provided
        if metadata.get("callback_url"):
            # Send result to callback URL
            # In production, this would make an actual HTTP request
            logger.info(f"Would send results to callback URL: {metadata['callback_url']}")
        
    except Exception as e:
        logger.error(f"Error processing sales call: {str(e)}")
        await background_manager.update_task_status(task_id, "failed", error=str(e)) 