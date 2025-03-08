from fastapi import APIRouter, Depends, HTTPException, Response
from app.dependencies import get_current_user
from app.models.user import User
from app.repositories.translated_video_repository import TranslatedVideoRepository
import os

router = APIRouter(prefix="/media")

@router.get("/subtitles/{translation_id}")
async def get_subtitles(
    translation_id: str,
    current_user: User = Depends(get_current_user),
    repository: TranslatedVideoRepository = Depends()
):
    """Get subtitles for a translated video"""
    try:
        translation = await repository.get_by_id(translation_id)
        
        if not translation:
            raise HTTPException(status_code=404, detail="Translation not found")
        
        # Check if user has access to this translation
        if translation.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You don't have access to this translation")
        
        if not translation.subtitle_path or not os.path.exists(translation.subtitle_path):
            raise HTTPException(status_code=404, detail="Subtitles not found")
        
        with open(translation.subtitle_path, 'rb') as f:
            content = f.read()
        
        return Response(content=content, media_type="text/srt")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch subtitles: {str(e)}")

@router.get("/audio-translation/{translation_id}")
async def get_audio_translation(
    translation_id: str,
    current_user: User = Depends(get_current_user),
    repository: TranslatedVideoRepository = Depends()
):
    """Get audio translation for a translated video"""
    try:
        translation = await repository.get_by_id(translation_id)
        
        if not translation:
            raise HTTPException(status_code=404, detail="Translation not found")
        
        # Check if user has access to this translation
        if translation.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You don't have access to this translation")
        
        if not translation.audio_translation_path or not os.path.exists(translation.audio_translation_path):
            raise HTTPException(status_code=404, detail="Audio translation not found")
        
        with open(translation.audio_translation_path, 'rb') as f:
            content = f.read()
        
        return Response(content=content, media_type="audio/mpeg")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch audio translation: {str(e)}") 