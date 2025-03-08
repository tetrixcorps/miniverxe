from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
import requests
from urllib.parse import urlencode
from app.config import settings
from app.services.auth.token_service import create_access_token
from app.models.user import User, UserCreate, SocialAccount
from app.repositories.user_repository import UserRepository

router = APIRouter()

class TikTokAuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
        self.client_key = settings.TIKTOK_CLIENT_KEY
        self.client_secret = settings.TIKTOK_CLIENT_SECRET
        self.redirect_uri = settings.TIKTOK_REDIRECT_URI
        
    async def get_oauth_url(self, state: str = None):
        """Generate TikTok OAuth URL with required scopes"""
        params = {
            "client_key": self.client_key,
            "response_type": "code",
            "scope": "user.info.basic,video.publish,video.upload,artist.certification.read,artist.certification.update",
            "redirect_uri": self.redirect_uri,
            "state": state or ""
        }
        return f"https://www.tiktok.com/auth/authorize/?{urlencode(params)}"
        
    async def handle_oauth_callback(self, code: str):
        """Exchange code for access token and user info"""
        # Exchange authorization code for access token
        token_response = await self._exchange_code(code)
        
        if "error" in token_response:
            raise HTTPException(status_code=400, detail=token_response["error"])
            
        # Get user info using the access token
        user_info = await self._get_user_info(token_response["access_token"])
        
        # Create or update user in our database
        user = await self._create_or_update_user(user_info, token_response)
        
        # Create our app's JWT token
        token = create_access_token({"sub": str(user.id)})
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user
        }
        
    async def _exchange_code(self, code: str):
        """Exchange authorization code for access token"""
        data = {
            "client_key": self.client_key,
            "client_secret": self.client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": self.redirect_uri
        }
        
        response = requests.post("https://open-api.tiktok.com/oauth/access_token/", data=data)
        return response.json()
        
    async def _get_user_info(self, access_token: str):
        """Get user info from TikTok API"""
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get("https://open-api.tiktok.com/user/info/", headers=headers)
        return response.json()
        
    async def _create_or_update_user(self, user_info, token_response):
        """Create or update user in our database"""
        tiktok_id = user_info["data"]["user"]["id"]
        existing_user = await self.user_repository.get_by_social_id("tiktok", tiktok_id)
        
        if existing_user:
            # Update existing user
            existing_user.social_accounts["tiktok"] = {
                "id": tiktok_id,
                "username": user_info["data"]["user"]["username"],
                "profile_image": user_info["data"]["user"]["avatar_url"],
                "access_token": token_response["access_token"],
                "refresh_token": token_response.get("refresh_token"),
                "expires_at": token_response.get("expires_in"),
                "scopes": token_response.get("scope", "").split(",")
            }
            return await self.user_repository.update(existing_user)
            
        # Create new user
        new_user = UserCreate(
            username=user_info["data"]["user"]["username"],
            email=user_info["data"]["user"].get("email", f"{tiktok_id}@tiktok.user"),
            social_accounts={
                "tiktok": {
                    "id": tiktok_id,
                    "username": user_info["data"]["user"]["username"],
                    "profile_image": user_info["data"]["user"]["avatar_url"],
                    "access_token": token_response["access_token"],
                    "refresh_token": token_response.get("refresh_token"),
                    "expires_at": token_response.get("expires_in"),
                    "scopes": token_response.get("scope", "").split(",")
                }
            }
        )
        return await self.user_repository.create(new_user) 