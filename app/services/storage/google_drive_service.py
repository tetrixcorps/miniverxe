import os
from typing import Dict, List, Optional, BinaryIO
import google.oauth2.credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io
import logging

logger = logging.getLogger(__name__)

class GoogleDriveService:
    def __init__(self):
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        self.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
        self.api_name = "drive"
        self.api_version = "v3"
        self.scopes = ["https://www.googleapis.com/auth/drive.readonly"]

    def get_authorization_url(self) -> Dict[str, str]:
        """Get the Google OAuth authorization URL"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [self.redirect_uri]
                }
            },
            scopes=self.scopes
        )
        
        flow.redirect_uri = self.redirect_uri
        
        auth_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        
        return {"auth_url": auth_url, "state": state}

    def get_credentials_from_code(self, code: str) -> Dict[str, str]:
        """Exchange authorization code for credentials"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [self.redirect_uri]
                }
            },
            scopes=self.scopes
        )
        
        flow.redirect_uri = self.redirect_uri
        
        # Exchange code for tokens
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Return tokens dict for storage
        return {
            "token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": credentials.scopes
        }

    def build_service(self, credentials_dict: Dict[str, str]):
        """Build a Google Drive service from stored credentials"""
        credentials = google.oauth2.credentials.Credentials(
            token=credentials_dict["token"],
            refresh_token=credentials_dict["refresh_token"],
            token_uri=credentials_dict["token_uri"],
            client_id=credentials_dict["client_id"],
            client_secret=credentials_dict["client_secret"],
            scopes=credentials_dict["scopes"]
        )
        
        service = build(self.api_name, self.api_version, credentials=credentials)
        return service

    async def list_files(self, credentials_dict: Dict[str, str], query: str = "mimeType contains 'video/'") -> List[Dict]:
        """List files from Google Drive matching the query"""
        try:
            service = self.build_service(credentials_dict)
            
            results = service.files().list(
                q=query,
                pageSize=50,
                fields="files(id, name, mimeType, createdTime, size, thumbnailLink)"
            ).execute()
            
            return results.get("files", [])
            
        except Exception as e:
            logger.error(f"Error listing files from Google Drive: {e}")
            raise

    async def download_file(self, credentials_dict: Dict[str, str], file_id: str) -> BinaryIO:
        """Download a file from Google Drive"""
        try:
            service = self.build_service(credentials_dict)
            
            request = service.files().get_media(fileId=file_id)
            file_handle = io.BytesIO()
            downloader = MediaIoBaseDownload(file_handle, request)
            
            done = False
            while not done:
                status, done = downloader.next_chunk()
            
            file_handle.seek(0)
            return file_handle
            
        except Exception as e:
            logger.error(f"Error downloading file from Google Drive: {e}")
            raise

    async def get_file_metadata(self, credentials_dict: Dict[str, str], file_id: str) -> Dict:
        """Get file metadata from Google Drive"""
        try:
            service = self.build_service(credentials_dict)
            
            return service.files().get(
                fileId=file_id,
                fields="id, name, mimeType, createdTime, size, description"
            ).execute()
            
        except Exception as e:
            logger.error(f"Error getting file metadata from Google Drive: {e}")
            raise 