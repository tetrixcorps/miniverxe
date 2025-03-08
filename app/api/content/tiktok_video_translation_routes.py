from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.services.tiktok.video_import_service import TikTokVideoImportService
from app.dependencies import get_current_user
from app.models.user import User
from app.repositories.translated_video_repository import TranslatedVideoRepository

router = APIRouter(prefix="/content")

@router.post("/tiktok/translate")
async def translate_tiktok_video(
    video_url: str,
    target_language: str,
    include_subtitles: bool = True,
    include_audio_translation: bool = False,
    current_user: User = Depends(get_current_user),
    video_import_service: TikTokVideoImportService = Depends()
):
    """Translate TikTok video content to target language"""
    try:
        # Validate target language is supported
        from app.constants import SUPPORTED_LANGUAGES
        if target_language not in SUPPORTED_LANGUAGES:
            raise HTTPException(
                status_code=400,
                detail=f"Language '{target_language}' is not supported. Supported languages: {', '.join(SUPPORTED_LANGUAGES.keys())}"
            )
        
        # Process the import and translation
        result = await video_import_service.import_and_translate_video(
            user_id=current_user.id,
            video_url=video_url,
            target_language=target_language,
            include_subtitles=include_subtitles,
            include_audio_translation=include_audio_translation
        )
        
        return {
            "status": "success",
            "translated_video_id": result["translated_video_id"],
            "original_language": result["original_language"],
            "target_language": result["target_language"]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to translate TikTok video: {str(e)}")

@router.get("/tiktok/translations")
async def list_translated_videos(
    current_user: User = Depends(get_current_user),
    repository: TranslatedVideoRepository = Depends()
):
    """List translated TikTok videos for the current user"""
    try:
        translations = await repository.get_by_user_id(current_user.id)
        return {
            "status": "success",
            "translations": translations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch translations: {str(e)}")

@router.get("/tiktok/translations/{translation_id}")
async def get_translated_video(
    translation_id: str,
    current_user: User = Depends(get_current_user),
    repository: TranslatedVideoRepository = Depends()
):
    """Get details of a specific translated TikTok video"""
    try:
        translation = await repository.get_by_id(translation_id)
        
        if not translation:
            raise HTTPException(status_code=404, detail="Translation not found")
        
        # Check if user has access to this translation
        if translation.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You don't have access to this translation")
        
        return {
            "status": "success",
            "translation": translation
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch translation: {str(e)}") 