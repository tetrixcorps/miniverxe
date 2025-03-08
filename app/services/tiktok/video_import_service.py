import requests
import json
import os
import tempfile
from typing import Dict, Any, Optional, List
from app.services.translation import TranslationService
from app.services.transcription import TranscriptionService
from app.orchestrators.translation_orchestrator import TranslationOrchestrator
from app.repositories.user_repository import UserRepository
from app.models.content import Content, TranslatedVideo
from app.config import settings
from app.exceptions import TikTokAPIError, ProcessingError

class TikTokVideoImportService:
    def __init__(
        self,
        user_repository: UserRepository,
        translation_orchestrator: TranslationOrchestrator,
        transcription_service: TranscriptionService,
        translation_service: TranslationService
    ):
        self.user_repository = user_repository
        self.translation_orchestrator = translation_orchestrator
        self.transcription_service = transcription_service
        self.translation_service = translation_service
        self.base_url = "https://open-api.tiktok.com"
        
    async def import_and_translate_video(
        self,
        user_id: str,
        video_url: str,
        target_language: str,
        include_subtitles: bool = True,
        include_audio_translation: bool = False,
        include_description_translation: bool = True
    ) -> Dict[str, Any]:
        """Import TikTok video and translate its content to target language"""
        # Get user
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        # Check if user has TikTok connection for accessing non-public videos
        has_tiktok_auth = "tiktok" in user.social_accounts
        
        # Extract video ID from URL
        video_id = self._extract_video_id(video_url)
        if not video_id:
            raise ValueError("Invalid TikTok video URL")
        
        # Fetch video metadata
        video_data = await self._fetch_video_metadata(video_id, user_id if has_tiktok_auth else None)
        
        # Download video content for processing
        video_path = await self._download_video(video_data["video_url"])
        
        try:
            results = {}
            processing_tasks = []
            
            # 1. Extract and translate description if requested
            if include_description_translation and video_data.get("description"):
                description_translation = await self.translation_service.translate(
                    video_data["description"],
                    target_language,
                    video_data.get("language_code", "auto")
                )
                results["translated_description"] = description_translation
            
            # 2. Transcribe video to get original text
            transcription_result = await self.transcription_service.transcribe_video(
                video_path,
                detect_language=True
            )
            
            original_text = transcription_result["text"]
            detected_language = transcription_result["detected_language"]
            results["original_text"] = original_text
            results["detected_language"] = detected_language
            
            # 3. Translate transcribed text
            translated_text = await self.translation_service.translate(
                original_text,
                target_language,
                detected_language
            )
            results["translated_text"] = translated_text
            
            # 4. Generate subtitles if requested
            if include_subtitles:
                subtitle_path = await self._generate_subtitles(
                    video_path,
                    transcription_result["segments"],
                    translated_text,
                    target_language
                )
                results["subtitle_path"] = subtitle_path
            
            # 5. Generate audio translation if requested
            if include_audio_translation:
                audio_translation_path = await self._generate_audio_translation(
                    translated_text,
                    target_language,
                    video_data["duration"]
                )
                results["audio_translation_path"] = audio_translation_path
            
            # 6. Create entry in database
            translated_video = await self._create_translated_video_record(
                user_id,
                video_id,
                video_data,
                target_language,
                results
            )
            
            return {
                "translated_video_id": str(translated_video.id),
                "original_video_url": video_url,
                "original_language": detected_language,
                "target_language": target_language,
                "results": results
            }
            
        finally:
            # Clean up downloaded video
            if os.path.exists(video_path):
                os.remove(video_path)
    
    def _extract_video_id(self, video_url: str) -> Optional[str]:
        """Extract TikTok video ID from URL"""
        # Handle various TikTok URL formats
        import re
        
        # Pattern 1: https://www.tiktok.com/@username/video/1234567890123456789
        pattern1 = r'tiktok\.com/[@\w]+/video/(\d+)'
        
        # Pattern 2: https://vm.tiktok.com/1234567890123456789
        pattern2 = r'vm\.tiktok\.com/(\w+)'
        
        # Try the first pattern
        match = re.search(pattern1, video_url)
        if match:
            return match.group(1)
        
        # If first pattern doesn't match, try the second pattern (short URLs)
        match = re.search(pattern2, video_url)
        if match:
            # For short URLs, we need to follow the redirect to get the actual video ID
            try:
                response = requests.head(video_url, allow_redirects=True)
                final_url = response.url
                
                # Extract from the final URL
                match = re.search(pattern1, final_url)
                if match:
                    return match.group(1)
            except Exception as e:
                print(f"Error following TikTok redirect: {e}")
        
        return None
    
    async def _fetch_video_metadata(self, video_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Fetch video metadata from TikTok API"""
        headers = {
            "Content-Type": "application/json",
        }
        
        # If user has TikTok auth, use their token for authenticated requests
        if user_id:
            user = await self.user_repository.get_by_id(user_id)
            if user and "tiktok" in user.social_accounts:
                headers["Authorization"] = f"Bearer {user.social_accounts['tiktok']['access_token']}"
        
        # Different endpoint based on whether we have auth or not
        if "Authorization" in headers:
            # Authenticated API request
            endpoint = f"{self.base_url}/video/query/"
            data = {"video_id": video_id}
            response = requests.post(endpoint, headers=headers, json=data)
        else:
            # Public API request (limited information)
            endpoint = f"{self.base_url}/video/info/"
            params = {"video_id": video_id}
            response = requests.get(endpoint, headers=headers, params=params)
        
        if not response.ok:
            raise TikTokAPIError(f"Failed to fetch video metadata: {response.text}")
        
        result = response.json()
        if "error" in result and result["error"]:
            raise TikTokAPIError(f"TikTok API error: {result['error']}")
        
        video_data = result["data"]["video"]
        
        return {
            "video_id": video_id,
            "title": video_data.get("title", ""),
            "description": video_data.get("description", ""),
            "author": video_data.get("author", {}).get("username", ""),
            "duration": video_data.get("duration", 0),
            "video_url": video_data.get("play_url", ""),
            "cover_url": video_data.get("cover_url", ""),
            "share_url": video_data.get("share_url", ""),
            "language_code": video_data.get("language", "auto"),
            "created_at": video_data.get("create_time", "")
        }
    
    async def _download_video(self, video_url: str) -> str:
        """Download video content to temporary file"""
        try:
            with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_file:
                response = requests.get(video_url, stream=True)
                if not response.ok:
                    raise ProcessingError(f"Failed to download video: HTTP {response.status_code}")
                
                for chunk in response.iter_content(chunk_size=8192):
                    temp_file.write(chunk)
                
                return temp_file.name
        except Exception as e:
            raise ProcessingError(f"Error downloading video: {str(e)}")
    
    async def _generate_subtitles(
        self,
        video_path: str,
        segments: List[Dict[str, Any]],
        translated_text: str,
        target_language: str
    ) -> str:
        """Generate subtitles in the target language"""
        # This could be a more complex implementation that aligns the
        # translated text with the original timing segments
        try:
            # Create a temporary file for the subtitles
            with tempfile.NamedTemporaryFile(suffix=".srt", delete=False) as subtitle_file:
                # Simple implementation - this would need more sophisticated 
                # time alignment in production
                
                # Get translated segments by running each segment text through translation
                translated_segments = []
                for segment in segments:
                    translated_segment_text = await self.translation_service.translate(
                        segment["text"],
                        target_language,
                        segment.get("language", "auto")
                    )
                    
                    translated_segments.append({
                        "start": segment["start"],
                        "end": segment["end"],
                        "text": translated_segment_text
                    })
                
                # Write segments to SRT file
                for i, segment in enumerate(translated_segments, 1):
                    start_time = self._format_time(segment["start"])
                    end_time = self._format_time(segment["end"])
                    
                    subtitle_file.write(f"{i}\n".encode())
                    subtitle_file.write(f"{start_time} --> {end_time}\n".encode())
                    subtitle_file.write(f"{segment['text']}\n\n".encode())
                
                return subtitle_file.name
        except Exception as e:
            raise ProcessingError(f"Error generating subtitles: {str(e)}")
    
    def _format_time(self, seconds: float) -> str:
        """Format seconds to SRT time format: HH:MM:SS,mmm"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        seconds = seconds % 60
        milliseconds = int((seconds - int(seconds)) * 1000)
        seconds = int(seconds)
        
        return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}"
    
    async def _generate_audio_translation(
        self,
        translated_text: str,
        target_language: str,
        original_duration: float
    ) -> str:
        """Generate audio translation in target language"""
        try:
            # This would connect to a Text-to-Speech service
            # For now, we'll mock this functionality
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as audio_file:
                # In a real implementation, this would call a TTS service
                # await self.tts_service.synthesize(translated_text, target_language, audio_file.name)
                
                # For now, we're just creating an empty file as a placeholder
                # In a real implementation, this would be replaced with actual TTS
                audio_file.write(b"PLACEHOLDER FOR TTS AUDIO")
                
                return audio_file.name
        except Exception as e:
            raise ProcessingError(f"Error generating audio translation: {str(e)}")
    
    async def _create_translated_video_record(
        self,
        user_id: str,
        video_id: str,
        video_data: Dict[str, Any],
        target_language: str,
        results: Dict[str, Any]
    ) -> TranslatedVideo:
        """Create a database record for the translated video"""
        # This would be implemented to save to your database
        # For now, we'll return a mock object
        translated_video = TranslatedVideo(
            user_id=user_id,
            tiktok_video_id=video_id,
            original_title=video_data["title"],
            original_author=video_data["author"],
            original_language=results["detected_language"],
            target_language=target_language,
            original_text=results["original_text"],
            translated_text=results["translated_text"],
            cover_image_url=video_data["cover_url"],
            share_url=video_data["share_url"],
            subtitle_path=results.get("subtitle_path", ""),
            audio_translation_path=results.get("audio_translation_path", ""),
        )
        
        # In a real implementation, save to database
        # await self.translated_video_repository.create(translated_video)
        
        return translated_video 