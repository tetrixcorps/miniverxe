import os
import asyncio
import tempfile
import requests
from typing import Dict, List, Optional, BinaryIO
from app.services.translation import TranslationService
from app.repositories.user_repository import UserRepository
from app.models.content import Content, ContentStatus
from app.exceptions import TikTokAPIError

class TikTokContentService:
    def __init__(
        self, 
        user_repository: UserRepository,
        translation_service: TranslationService
    ):
        self.user_repository = user_repository
        self.translation_service = translation_service
        self.base_url = "https://open-api.tiktok.com"
        
    async def publish_video(
        self, 
        user_id: str, 
        video_file: BinaryIO, 
        title: str, 
        description: str = None,
        language: str = "eng",
        translate_captions: bool = False,
        caption_languages: List[str] = None,
        privacy_level: str = "PUBLIC"
    ):
        """Publish video to TikTok with optional multilingual captions"""
        # Get user's TikTok credentials
        user = await self.user_repository.get_by_id(user_id)
        if not user or "tiktok" not in user.social_accounts:
            raise ValueError("User not connected to TikTok")
            
        tiktok_token = user.social_accounts["tiktok"]["access_token"]
        
        # Start video upload
        upload_result = await self._upload_video(tiktok_token, video_file)
        
        # Prepare captions in multiple languages if requested
        captions = {}
        if translate_captions and caption_languages:
            for target_lang in caption_languages:
                translated_title = await self.translation_service.translate(
                    title, 
                    target_lang=target_lang, 
                    source_lang=language
                )
                captions[target_lang] = translated_title
        
        # Create video post
        create_result = await self._create_post(
            tiktok_token,
            upload_result["video_id"],
            title,
            description,
            privacy_level,
            captions
        )
        
        return {
            "tiktok_post_id": create_result["post_id"],
            "share_url": create_result["share_url"],
            "status": "PUBLISHED"
        }
        
    async def _upload_video(self, token: str, video_file: BinaryIO):
        """Upload video to TikTok"""
        # Step 1: Initiate upload
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        init_response = requests.post(
            f"{self.base_url}/video/upload/",
            headers=headers,
            json={"source_info": {"source": "FILE_UPLOAD"}}
        )
        
        if not init_response.ok:
            raise TikTokAPIError(f"Failed to initiate upload: {init_response.text}")
        
        init_data = init_response.json()["data"]
        upload_url = init_data["upload_url"]
        video_id = init_data["video_id"]
        
        # Step 2: Upload the video file
        upload_response = requests.put(
            upload_url,
            data=video_file,
            headers={"Content-Type": "application/octet-stream"}
        )
        
        if not upload_response.ok:
            raise TikTokAPIError(f"Failed to upload video: {upload_response.text}")
            
        return {"video_id": video_id}
        
    async def _create_post(
        self, 
        token: str, 
        video_id: str, 
        title: str, 
        description: str = None,
        privacy_level: str = "PUBLIC",
        captions: Dict[str, str] = None
    ):
        """Create a post with the uploaded video"""
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Build post data
        post_data = {
            "video_id": video_id,
            "title": title,
            "privacy_level": privacy_level
        }
        
        if description:
            post_data["description"] = description
            
        # Add multilingual captions if provided
        if captions:
            post_data["captions"] = [
                {"language": lang, "text": text}
                for lang, text in captions.items()
            ]
        
        # Create the post
        post_response = requests.post(
            f"{self.base_url}/video/publish/",
            headers=headers,
            json=post_data
        )
        
        if not post_response.ok:
            raise TikTokAPIError(f"Failed to create post: {post_response.text}")
            
        post_data = post_response.json()["data"]
        return {
            "post_id": post_data["post_id"],
            "share_url": post_data.get("share_url", "")
        } 