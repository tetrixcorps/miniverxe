from typing import List, Optional
from app.models.content import TranslatedVideo
from app.database import get_db_connection

class TranslatedVideoRepository:
    def __init__(self):
        self.db = get_db_connection()
        self.collection = self.db["translated_videos"]
    
    async def create(self, video: TranslatedVideo) -> TranslatedVideo:
        """Create a new translated video record"""
        result = await self.collection.insert_one(video.dict())
        video.id = str(result.inserted_id)
        return video
    
    async def get_by_id(self, video_id: str) -> Optional[TranslatedVideo]:
        """Get translated video by ID"""
        result = await self.collection.find_one({"id": video_id})
        if result:
            return TranslatedVideo(**result)
        return None
    
    async def get_by_user_id(self, user_id: str) -> List[TranslatedVideo]:
        """Get all translated videos for a specific user"""
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1)
        results = await cursor.to_list(length=100)  # Limit to 100 most recent
        return [TranslatedVideo(**result) for result in results]
    
    async def get_by_tiktok_video_id(self, tiktok_video_id: str, user_id: Optional[str] = None) -> List[TranslatedVideo]:
        """Get translated videos by TikTok video ID"""
        query = {"tiktok_video_id": tiktok_video_id}
        if user_id:
            query["user_id"] = user_id
            
        cursor = self.collection.find(query).sort("created_at", -1)
        results = await cursor.to_list(length=100)
        return [TranslatedVideo(**result) for result in results]
    
    async def update(self, video: TranslatedVideo) -> TranslatedVideo:
        """Update an existing translated video record"""
        video.updated_at = datetime.utcnow()
        await self.collection.replace_one({"id": video.id}, video.dict())
        return video
    
    async def delete(self, video_id: str) -> bool:
        """Delete a translated video record"""
        result = await self.collection.delete_one({"id": video_id})
        return result.deleted_count > 0
    
    async def search(self, user_id: str, query: str) -> List[TranslatedVideo]:
        """Search for translated videos by title or content"""
        search_query = {
            "user_id": user_id,
            "$or": [
                {"original_title": {"$regex": query, "$options": "i"}},
                {"original_text": {"$regex": query, "$options": "i"}},
                {"translated_text": {"$regex": query, "$options": "i"}}
            ]
        }
        
        cursor = self.collection.find(search_query).sort("created_at", -1)
        results = await cursor.to_list(length=100)
        return [TranslatedVideo(**result) for result in results] 