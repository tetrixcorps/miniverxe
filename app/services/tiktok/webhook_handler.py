import json
import logging
from typing import Dict, Any
from app.repositories.user_repository import UserRepository
from app.repositories.content_repository import ContentRepository
from app.services.notification import NotificationService

logger = logging.getLogger(__name__)

class TikTokWebhookHandler:
    def __init__(
        self,
        user_repository: UserRepository,
        content_repository: ContentRepository,
        notification_service: NotificationService
    ):
        self.user_repository = user_repository
        self.content_repository = content_repository
        self.notification_service = notification_service
        
    async def handle_event(self, event_type: str, raw_body: bytes) -> Dict[str, Any]:
        """Handle TikTok webhook events"""
        try:
            body = json.loads(raw_body)
            
            # Route to appropriate handler based on event type
            if event_type == "video.publish_success":
                return await self._handle_video_publish_success(body)
            elif event_type == "video.publish_fail":
                return await self._handle_video_publish_fail(body)
            elif event_type == "video.remove":
                return await self._handle_video_remove(body)
            elif event_type == "creator.certification.update":
                return await self._handle_creator_certification_update(body)
            else:
                logger.warning(f"Unhandled TikTok webhook event: {event_type}")
                return {"handled": False, "event_type": event_type}
                
        except Exception as e:
            logger.error(f"Error handling TikTok webhook: {e}")
            raise
    
    async def _handle_video_publish_success(self, body: Dict[str, Any]) -> Dict[str, Any]:
        """Handle video.publish_success event"""
        video_id = body.get("video_id")
        post_id = body.get("post_id")
        tiktok_user_id = body.get("user_id")
        
        # Find user by TikTok ID
        user = await self.user_repository.get_by_social_id("tiktok", tiktok_user_id)
        if not user:
            return {"handled": False, "reason": "User not found"}
            
        # Update content status in our database
        content = await self.content_repository.get_by_tiktok_video_id(video_id)
        if content:
            content.tiktok_post_id = post_id
            content.status = "PUBLISHED"
            content.tiktok_share_url = body.get("share_url", "")
            await self.content_repository.update(content)
            
            # Send notification to user
            await self.notification_service.send_notification(
                user_id=user.id,
                title="TikTok Video Published",
                body=f"Your video '{content.title}' has been published to TikTok!",
                data={
                    "content_id": str(content.id),
                    "tiktok_post_id": post_id,
                    "share_url": content.tiktok_share_url
                }
            )
            
            return {
                "handled": True,
                "content_id": str(content.id),
                "tiktok_post_id": post_id
            }
        
        return {"handled": False, "reason": "Content not found"}
        
    async def _handle_video_publish_fail(self, body: Dict[str, Any]) -> Dict[str, Any]:
        """Handle video.publish_fail event"""
        video_id = body.get("video_id")
        tiktok_user_id = body.get("user_id")
        error_code = body.get("error_code")
        error_message = body.get("error_message")
        
        # Find user by TikTok ID
        user = await self.user_repository.get_by_social_id("tiktok", tiktok_user_id)
        if not user:
            return {"handled": False, "reason": "User not found"}
            
        # Update content status in our database
        content = await self.content_repository.get_by_tiktok_video_id(video_id)
        if content:
            content.status = "FAILED"
            content.status_message = f"TikTok Error: {error_message} (Code: {error_code})"
            await self.content_repository.update(content)
            
            # Send notification to user
            await self.notification_service.send_notification(
                user_id=user.id,
                title="TikTok Publishing Failed",
                body=f"Publishing to TikTok failed: {error_message}",
                data={
                    "content_id": str(content.id),
                    "error_code": error_code,
                    "error_message": error_message
                }
            )
            
            return {
                "handled": True,
                "content_id": str(content.id),
                "error": error_message
            }
        
        return {"handled": False, "reason": "Content not found"}
    
    async def _handle_video_remove(self, body: Dict[str, Any]) -> Dict[str, Any]:
        """Handle video.remove event"""
        post_id = body.get("post_id")
        tiktok_user_id = body.get("user_id")
        
        # Find user by TikTok ID
        user = await self.user_repository.get_by_social_id("tiktok", tiktok_user_id)
        if not user:
            return {"handled": False, "reason": "User not found"}
            
        # Update content status in our database
        content = await self.content_repository.get_by_tiktok_post_id(post_id)
        if content:
            content.status = "REMOVED_FROM_TIKTOK"
            await self.content_repository.update(content)
            
            # Send notification to user
            await self.notification_service.send_notification(
                user_id=user.id,
                title="TikTok Video Removed",
                body=f"Your video '{content.title}' has been removed from TikTok.",
                data={
                    "content_id": str(content.id)
                }
            )
            
            return {
                "handled": True,
                "content_id": str(content.id)
            }
        
        return {"handled": False, "reason": "Content not found"}
        
    async def _handle_creator_certification_update(self, body: Dict[str, Any]) -> Dict[str, Any]:
        """Handle creator.certification.update event"""
        tiktok_user_id = body.get("user_id")
        certification_status = body.get("certification_status")
        certification_type = body.get("certification_type")
        
        # Find user by TikTok ID
        user = await self.user_repository.get_by_social_id("tiktok", tiktok_user_id)
        if not user:
            return {"handled": False, "reason": "User not found"}
        
        # Update user's TikTok certification status
        if "tiktok" in user.social_accounts:
            if "certifications" not in user.social_accounts["tiktok"]:
                user.social_accounts["tiktok"]["certifications"] = {}
                
            user.social_accounts["tiktok"]["certifications"][certification_type] = {
                "status": certification_status,
                "updated_at": body.get("update_time")
            }
            
            await self.user_repository.update(user)
            
            # Send notification to user
            await self.notification_service.send_notification(
                user_id=user.id,
                title="TikTok Certification Updated",
                body=f"Your {certification_type} certification status is now {certification_status}",
                data={
                    "certification_type": certification_type,
                    "certification_status": certification_status
                }
            )
            
            return {
                "handled": True,
                "user_id": str(user.id),
                "certification_type": certification_type,
                "certification_status": certification_status
            }
        
        return {"handled": False, "reason": "User TikTok account not found"} 