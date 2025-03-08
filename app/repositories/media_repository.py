from typing import List, Optional, Dict, Any
from bson.objectid import ObjectId
from datetime import datetime
from app.database import get_db_connection

class MediaRepository:
    def __init__(self):
        self.db = get_db_connection()
        self.collection = self.db["media_files"]
        
    async def create(self, media_data: Dict[str, Any]) -> str:
        """Create a new media record"""
        media_data["created_at"] = datetime.utcnow()
        media_data["updated_at"] = datetime.utcnow()
        
        result = await self.collection.insert_one(media_data)
        return str(result.inserted_id)
        
    async def get_by_id(self, media_id: str) -> Optional[Dict[str, Any]]:
        """Get media by ID"""
        result = await self.collection.find_one({"_id": ObjectId(media_id)})
        if result:
            result["id"] = str(result.pop("_id"))
            return result
        return None
        
    async def get_by_user(self, user_id: str, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        """Get all media for a user"""
        cursor = self.collection.find({"user_id": user_id})
        cursor = cursor.sort("created_at", -1).skip(skip).limit(limit)
        
        result = await cursor.to_list(length=limit)
        for doc in result:
            doc["id"] = str(doc.pop("_id"))
            
        return result
        
    async def update_processing_status(self, media_id: str, status: str, result: Optional[Dict] = None) -> bool:
        """Update the processing status of a media file"""
        update_data = {
            "processing_status": status,
            "updated_at": datetime.utcnow()
        }
        
        if result:
            update_data["processing_result"] = result
            
        result = await self.collection.update_one(
            {"_id": ObjectId(media_id)},
            {"$set": update_data}
        )
        
        return result.modified_count > 0
        
    async def delete(self, media_id: str) -> bool:
        """Delete a media record"""
        result = await self.collection.delete_one({"_id": ObjectId(media_id)})
        return result.deleted_count > 0 