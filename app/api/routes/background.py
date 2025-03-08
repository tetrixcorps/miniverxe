from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, File, UploadFile
from typing import Dict, Any, Optional, List
import logging
import asyncio
from app.services.service_manager import ServiceManager
from app.utils.auth import get_current_user
from app.core.auth import get_current_user
from app.models.user import User
from app.models.tasks import TaskCreate, TaskStatus, MediaProcessingTask
from app.services.media_service import MediaProcessingService
from app.repositories.tasks_repository import TasksRepository

router = APIRouter(prefix="/background", tags=["Background Processing"])
logger = logging.getLogger(__name__)

async def get_service_manager():
    """Get the service manager as a dependency"""
    service_manager = ServiceManager()
    yield service_manager

@router.post("/task", summary="Create a background task")
async def create_task(
    task_type: str,
    payload: Dict[str, Any],
    service_manager: ServiceManager = Depends(get_service_manager),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """
    Create a background task to be processed asynchronously.
    
    This endpoint allows submitting tasks that will be processed in the background,
    even if the API service or network connection becomes unavailable.
    
    - **task_type**: The type of task to create
    - **payload**: The task data
    """
    try:
        # Add user information to the payload if available
        if current_user:
            payload["user_id"] = current_user.get("id")
            
        task_id = await service_manager.enqueue_task(task_type, payload)
        
        return {
            "status": "success",
            "task_id": task_id,
            "message": "Task queued for processing"
        }
    except Exception as e:
        logger.error(f"Error creating task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/task/{task_id}", summary="Get task status")
async def get_task_status(
    task_id: str,
    service_manager: ServiceManager = Depends(get_service_manager),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """
    Get the status of a background task.
    
    Returns information about a previously submitted background task,
    including its status and result if available.
    
    - **task_id**: The ID of the task to check
    """
    try:
        # Try to get the task status immediately (non-blocking)
        task_info = await service_manager.wait_for_task(task_id, timeout=0.1)
        
        if task_info is None:
            # Task not found or still in progress
            return {
                "status": "pending",
                "task_id": task_id,
                "message": "Task is still being processed"
            }
            
        # Return task information
        return {
            "status": task_info.get("status", "unknown"),
            "task_id": task_id,
            "created_at": task_info.get("created_at"),
            "completed_at": task_info.get("completed_at"),
            "result": task_info.get("result")
        }
    except Exception as e:
        logger.error(f"Error getting task status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync", summary="Queue data for synchronization")
async def queue_for_sync(
    sync_type: str,
    data: Dict[str, Any],
    service_manager: ServiceManager = Depends(get_service_manager),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """
    Queue data for synchronization when online.
    
    This endpoint allows saving data that will be synchronized with remote services
    when internet connectivity is available.
    
    - **sync_type**: The type of data to sync (model_data, metrics, logs, user_feedback, config)
    - **data**: The data to synchronize
    """
    try:
        # Add user information if available
        if current_user:
            data["user_id"] = current_user.get("id")
            
        success = await service_manager.queue_for_sync(sync_type, data)
        
        if success:
            return {
                "status": "success",
                "message": f"Data queued for {sync_type} synchronization"
            }
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Failed to queue data for {sync_type} synchronization"
            )
    except Exception as e:
        logger.error(f"Error queuing data for sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/service-status", summary="Get service status")
async def get_service_status(
    service_manager: ServiceManager = Depends(get_service_manager)
):
    """
    Get the status of background services.
    
    Returns information about the status of background services and task queues.
    """
    try:
        status = service_manager.get_service_status()
        return status
    except Exception as e:
        logger.error(f"Error getting service status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Add new media processing routes
@router.post("/media/process", response_model=TaskStatus)
async def process_media_file(
    file: UploadFile = File(...),
    tasks: List[str] = None,
    language: str = "en-US",
    enhance_resolution: bool = False,
    denoise_audio: bool = False,
    categorize_content: bool = False,
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user)
):
    """
    Process media file with Holoscan for various tasks including:
    - Transcription
    - Media enhancement
    - Content categorization
    - Language detection/translation
    """
    if not tasks:
        tasks = ["transcribe", "enhance", "categorize"]
    
    # Create a new background task
    media_task = MediaProcessingTask(
        user_id=current_user.id,
        file_name=file.filename,
        processing_tasks=tasks,
        parameters={
            "language": language,
            "enhance_resolution": enhance_resolution,
            "denoise_audio": denoise_audio,
            "categorize_content": categorize_content
        }
    )
    
    # Save file to temporary storage
    temp_file_path = await save_upload_file(file)
    
    # Create a task in the database
    task_repo = TasksRepository()
    task_id = await task_repo.create_task(
        TaskCreate(
            type="media_processing",
            user_id=current_user.id,
            status="created",
            parameters=media_task.dict()
        )
    )
    
    # Add to background processing queue
    media_service = MediaProcessingService()
    background_tasks.add_task(
        media_service.process_media,
        task_id=task_id,
        file_path=temp_file_path,
        parameters=media_task.parameters,
        tasks=media_task.processing_tasks
    )
    
    return {
        "task_id": task_id,
        "status": "created",
        "message": f"Processing {file.filename} for {', '.join(tasks)}"
    }

@router.get("/media/tasks/{task_id}/status", response_model=TaskStatus)
async def get_media_task_status(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get status of a media processing task with detailed progress information"""
    task_repo = TasksRepository()
    task = await task_repo.get_task(task_id)
    
    # Security check - verify task ownership
    if task.user_id != current_user.id and not current_user.has_permission("admin:tasks"):
        raise HTTPException(status_code=403, detail="Not authorized to access this task")
    
    # Format response with media-specific details
    if task.type == "media_processing":
        result = task.result or {}
        return {
            "task_id": task.id,
            "status": task.status,
            "progress": task.progress,
            "created_at": task.created_at,
            "completed_at": task.completed_at,
            "media_details": {
                "transcription_complete": result.get("transcription_complete", False),
                "enhancement_complete": result.get("enhancement_complete", False),
                "categorization_complete": result.get("categorization_complete", False),
                "detected_language": result.get("detected_language"),
                "duration": result.get("duration"),
                "resolution": result.get("resolution"),
                "categories": result.get("categories", []),
                "enhanced_url": result.get("enhanced_url") if task.status == "completed" else None
            }
        }
    else:
        # Standard response for other task types
        return {
            "task_id": task.id,
            "status": task.status,
            "progress": task.progress,
            "result": task.result if task.status == "completed" else None,
            "error": task.error if task.status == "failed" else None,
            "created_at": task.created_at,
            "completed_at": task.completed_at
        } 