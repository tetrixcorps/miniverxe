from typing import Dict, Any
from bson.objectid import ObjectId

class UserRepository:
    async def update_oauth_state(self, user_id: str, provider: str, state: str) -> bool:
        """Store OAuth state for verification"""
        result = await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {f"oauth_states.{provider}": state}}
        )
        return result.modified_count > 0

    async def update_integration_credentials(self, user_id: str, provider: str, credentials: Dict[str, Any]) -> bool:
        """Store integration credentials"""
        result = await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {f"integration_credentials.{provider}": credentials}}
        )
        return result.modified_count > 0

    async def get_user_integrations(self, user_id: str) -> Dict[str, Any]:
        """Get user's connected integrations"""
        user = await self.get_by_id(user_id)
        if not user:
            return {"connected_integrations": []}
        
        connected_integrations = []
        if user.get("integration_credentials"):
            connected_integrations = list(user["integration_credentials"].keys())
        
        return {
            "connected_integrations": connected_integrations
        }

    async def remove_integration(self, user_id: str, provider: str) -> bool:
        """Remove integration credentials"""
        result = await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$unset": {f"integration_credentials.{provider}": ""}}
        )
        return result.modified_count > 0 