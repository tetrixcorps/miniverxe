from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from app.services.content.tiktok_content_service import TikTokContentService
from app.dependencies import get_current_user
from app.models.user import User
import io

router = APIRouter(prefix="/content")

@router.post("/tiktok/publish")
async def publish_to_tiktok(
    video: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    privacy_level: str = Form("PUBLIC"),
    translate_captions: bool = Form(False),
    caption_languages: List[str] = Form([]),
    current_user: User = Depends(get_current_user),
    tiktok_content_service: TikTokContentService = Depends()
):
    """Publish video to TikTok"""
    if "tiktok" not in current_user.social_accounts:
        raise HTTPException(
            status_code=400, 
            detail="You need to connect your TikTok account first"
        )
    
    try:
        # Read video content
        video_content = await video.read()
        
        # Validate privacy level
        valid_privacy_levels = ["PUBLIC", "FRIENDS", "PRIVATE"]
        if privacy_level not in valid_privacy_levels:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid privacy level. Must be one of: {', '.join(valid_privacy_levels)}"
            )
        
        # Publish to TikTok
        result = await tiktok_content_service.publish_video(
            user_id=current_user.id,
            video_file=io.BytesIO(video_content),
            title=title,
            description=description,
            language=current_user.language_preference,
            translate_captions=translate_captions,
            caption_languages=caption_languages if translate_captions else None,
            privacy_level=privacy_level
        )
        
        return {
            "status": "success",
            "tiktok_post_id": result["tiktok_post_id"],
            "share_url": result["share_url"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to publish to TikTok: {str(e)}"
        ) 