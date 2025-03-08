from fastapi import APIRouter, Depends, HTTPException, Response
import requests
from app.dependencies import get_current_user
from app.models.user import User
from app.repositories.translated_video_repository import TranslatedVideoRepository
from app.services.tiktok.video_import_service import TikTokVideoImportService

router = APIRouter(prefix="/proxy")

@router.get("/video/{tiktok_video_id}")
async def proxy_tiktok_video(
    tiktok_video_id: str,
    current_user: User = Depends(get_current_user),
    repository: TranslatedVideoRepository = Depends(),
    video_import_service: TikTokVideoImportService = Depends()
):
    """Proxy TikTok video to avoid CORS issues"""
    try:
        # Verify the user has a translation for this video
        translations = await repository.get_by_tiktok_video_id(tiktok_video_id, current_user.id)
        
        if not translations:
            raise HTTPException(status_code=403, detail="You don't have access to this video")
        
        # Get video metadata to find the URL
        video_data = await video_import_service._fetch_video_metadata(
            tiktok_video_id, 
            current_user.id if "tiktok" in current_user.social_accounts else None
        )
        
        if not video_data or not video_data.get("video_url"):
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Stream the video content
        response = requests.get(video_data["video_url"], stream=True)
        
        if not response.ok:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch video")
        
        return Response(
            content=response.content,
            media_type="video/mp4",
            headers={"Content-Disposition": f"inline; filename={tiktok_video_id}.mp4"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to proxy video: {str(e)}") 