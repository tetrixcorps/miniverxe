from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from app.dependencies import get_current_user
from app.models.user import User
from app.services.storage.spaces_service import SpacesStorageService
from app.repositories.media_repository import MediaRepository
from typing import Optional
import asyncio

router = APIRouter(prefix="/content")

@router.post("/upload/video")
async def upload_video(
    video: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    language: Optional[str] = Form(None),
    transcribe: bool = Form(False),
    translate_to: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    storage_service: SpacesStorageService = Depends(),
    media_repository: MediaRepository = Depends()
):
    """Upload a video and optionally request transcription/translation"""
    
    # Validate video file
    if not video.content_type or not video.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    try:
        # Upload to DO Spaces
        storage_data = await storage_service.upload_video(video, current_user.id)
        
        # Create database record
        media_data = {
            "user_id": current_user.id,
            "title": title,
            "description": description,
            "original_language": language,
            "storage_data": storage_data,
            "type": "video",
            "processing_status": "pending" if transcribe else "uploaded",
            "transcribe": transcribe,
            "translate_to": translate_to if transcribe and translate_to else None
        }
        
        media_id = await media_repository.create(media_data)
        
        # If transcription is requested, trigger async process
        if transcribe:
            # This would normally be done via a task queue like Celery
            # For simplicity, we're using asyncio here
            asyncio.create_task(
                trigger_transcription_job(media_id, storage_data["storage_path"], language, translate_to)
            )
        
        return {
            "id": media_id,
            "title": title,
            "status": "processing" if transcribe else "uploaded",
            "storage_url": storage_data["storage_url"],
            "message": "Video uploaded successfully" + (", transcription in progress" if transcribe else "")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

async def trigger_transcription_job(media_id: str, storage_path: str, language: Optional[str], translate_to: Optional[str]):
    """Trigger transcription job asynchronously"""
    # This would typically call your existing transcription/translation service
    # For now, this is a placeholder
    pass

@router.get("/videos")
async def list_videos(
    limit: int = 50,
    skip: int = 0,
    current_user: User = Depends(get_current_user),
    media_repository: MediaRepository = Depends(),
    storage_service: SpacesStorageService = Depends()
):
    """List videos uploaded by the current user"""
    
    videos = await media_repository.get_by_user(current_user.id, limit, skip)
    
    # Generate temporary access URLs for each video
    for video in videos:
        if "storage_data" in video and "storage_path" in video["storage_data"]:
            video["access_url"] = storage_service.generate_presigned_url(
                video["storage_data"]["storage_path"]
            )
    
    return videos

@router.delete("/videos/{media_id}")
async def delete_video(
    media_id: str,
    current_user: User = Depends(get_current_user),
    media_repository: MediaRepository = Depends(),
    storage_service: SpacesStorageService = Depends()
):
    """Delete a video"""
    
    # Get the video first to check ownership and get storage path
    video = await media_repository.get_by_id(media_id)
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    if video["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this video")
    
    # Delete from storage
    if "storage_data" in video and "storage_path" in video["storage_data"]:
        await storage_service.delete_file(video["storage_data"]["storage_path"])
    
    # Delete from database
    success = await media_repository.delete(media_id)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete video")
    
    return {"status": "success", "message": "Video deleted successfully"} 