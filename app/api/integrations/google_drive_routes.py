from fastapi import APIRouter, Depends, HTTPException, Query
from app.dependencies import get_current_user
from app.models.user import User
from app.services.storage.google_drive_service import GoogleDriveService
from app.repositories.user_repository import UserRepository
from app.services.storage.spaces_service import SpacesStorageService
from app.repositories.media_repository import MediaRepository
from typing import List, Optional
from fastapi.responses import RedirectResponse
import io
from tempfile import NamedTemporaryFile
import os

router = APIRouter(prefix="/integrations/google-drive")

@router.get("/auth")
async def auth_google_drive(
    current_user: User = Depends(get_current_user),
    drive_service: GoogleDriveService = Depends(),
    user_repository: UserRepository = Depends()
):
    """Start Google Drive OAuth flow"""
    auth_data = drive_service.get_authorization_url()
    
    # Store the state temporarily with the user for verification
    await user_repository.update_oauth_state(current_user.id, "google_drive", auth_data["state"])
    
    return {"auth_url": auth_data["auth_url"]}

@router.get("/callback")
async def google_drive_callback(
    code: str,
    state: str,
    current_user: User = Depends(get_current_user),
    drive_service: GoogleDriveService = Depends(),
    user_repository: UserRepository = Depends()
):
    """Handle Google Drive OAuth callback"""
    # Verify state
    stored_state = current_user.oauth_states.get("google_drive")
    
    if not stored_state or stored_state != state:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    
    # Exchange code for credentials
    credentials = drive_service.get_credentials_from_code(code)
    
    # Store credentials with user
    await user_repository.update_integration_credentials(
        current_user.id, 
        "google_drive", 
        credentials
    )
    
    # Redirect to frontend
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    return RedirectResponse(f"{frontend_url}/creator/integrations/google-drive/success")

@router.get("/files")
async def list_drive_files(
    query: str = "mimeType contains 'video/'",
    current_user: User = Depends(get_current_user),
    drive_service: GoogleDriveService = Depends()
):
    """List files from user's Google Drive"""
    if not current_user.integration_credentials or "google_drive" not in current_user.integration_credentials:
        raise HTTPException(status_code=400, detail="Google Drive not connected")
    
    credentials = current_user.integration_credentials["google_drive"]
    
    try:
        files = await drive_service.list_files(credentials, query)
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")

@router.post("/import/{file_id}")
async def import_drive_file(
    file_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    transcribe: bool = False,
    translate_to: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    drive_service: GoogleDriveService = Depends(),
    storage_service: SpacesStorageService = Depends(),
    media_repository: MediaRepository = Depends()
):
    """Import a file from Google Drive to the platform"""
    if not current_user.integration_credentials or "google_drive" not in current_user.integration_credentials:
        raise HTTPException(status_code=400, detail="Google Drive not connected")
    
    credentials = current_user.integration_credentials["google_drive"]
    
    try:
        # Get file metadata
        file_metadata = await drive_service.get_file_metadata(credentials, file_id)
        
        # Use provided title or default to file name
        if not title:
            title = file_metadata.get("name", "Imported video")
            
        # Download file from Google Drive
        file_content = await drive_service.download_file(credentials, file_id)
        
        # Create a temporary file
        with NamedTemporaryFile(delete=False, suffix=f".{file_metadata.get('name', '').split('.')[-1]}") as temp_file:
            temp_file.write(file_content.read())
            temp_file_path = temp_file.name
        
        try:
            # Create UploadFile object
            with open(temp_file_path, "rb") as f:
                from fastapi import UploadFile
                upload_file = UploadFile(
                    file=f,
                    filename=file_metadata.get("name", "video.mp4"),
                    content_type=file_metadata.get("mimeType", "video/mp4")
                )
                
                # Upload to DO Spaces
                storage_data = await storage_service.upload_video(upload_file, current_user.id)
                
                # Create database record
                media_data = {
                    "user_id": current_user.id,
                    "title": title,
                    "description": description or file_metadata.get("description", ""),
                    "source": "google_drive",
                    "source_id": file_id,
                    "storage_data": storage_data,
                    "type": "video",
                    "processing_status": "pending" if transcribe else "uploaded",
                    "transcribe": transcribe,
                    "translate_to": translate_to if transcribe and translate_to else None,
                    "original_metadata": file_metadata
                }
                
                media_id = await media_repository.create(media_data)
                
                # If transcription is requested, trigger async process
                if transcribe:
                    import asyncio
                    asyncio.create_task(
                        trigger_transcription_job(media_id, storage_data["storage_path"], None, translate_to)
                    )
                
                return {
                    "id": media_id,
                    "title": title,
                    "status": "processing" if transcribe else "uploaded",
                    "storage_url": storage_data["storage_url"],
                    "message": "Video imported successfully" + (", transcription in progress" if transcribe else "")
                }
                
        finally:
            # Clean up temp file
            os.unlink(temp_file_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to import file: {str(e)}")

async def trigger_transcription_job(media_id: str, storage_path: str, language: Optional[str], translate_to: Optional[str]):
    """Trigger transcription job asynchronously"""
    # This would typically call your existing transcription/translation service
    # For now, this is a placeholder
    pass 