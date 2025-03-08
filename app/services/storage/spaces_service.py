import os
import uuid
import boto3
from typing import Dict, Optional, BinaryIO, Tuple
from datetime import datetime, timedelta
from botocore.client import Config
from fastapi import UploadFile
import logging

logger = logging.getLogger(__name__)

class SpacesStorageService:
    def __init__(self):
        # Initialize S3 client with DO Spaces configuration
        self.s3_client = boto3.client(
            's3',
            region_name=os.getenv('DO_SPACES_REGION', 'nyc3'),
            endpoint_url=f"https://{os.getenv('DO_SPACES_REGION', 'nyc3')}.digitaloceanspaces.com",
            aws_access_key_id=os.getenv('DO_SPACES_KEY'),
            aws_secret_access_key=os.getenv('DO_SPACES_SECRET'),
            config=Config(signature_version='s3v4')
        )
        self.bucket_name = os.getenv('DO_SPACES_BUCKET')
        self.base_url = f"https://{self.bucket_name}.{os.getenv('DO_SPACES_REGION', 'nyc3')}.digitaloceanspaces.com"

    async def upload_video(self, file: UploadFile, user_id: str) -> Dict[str, str]:
        """
        Upload a video file to DO Spaces
        """
        try:
            # Generate a unique file name
            original_filename = file.filename
            ext = original_filename.split('.')[-1] if '.' in original_filename else 'mp4'
            unique_filename = f"{uuid.uuid4()}.{ext}"
            
            # Organize files by user and date
            today = datetime.utcnow().strftime('%Y-%m-%d')
            key = f"uploads/{user_id}/{today}/{unique_filename}"
            
            # Read file content
            content = await file.read()
            
            # Upload to DO Spaces
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=content,
                ACL='private',
                ContentType=file.content_type or 'video/mp4'
            )
            
            # Return metadata about the uploaded file
            return {
                "storage_path": key,
                "original_filename": original_filename,
                "content_type": file.content_type or 'video/mp4',
                "size_bytes": len(content),
                "upload_timestamp": datetime.utcnow().isoformat(),
                "storage_url": f"{self.base_url}/{key}"
            }
            
        except Exception as e:
            logger.error(f"Error uploading file to DO Spaces: {e}")
            raise

    def generate_presigned_url(self, storage_path: str, expiry_minutes: int = 60) -> str:
        """
        Generate a time-limited presigned URL for video access
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': storage_path
                },
                ExpiresIn=expiry_minutes * 60
            )
            return url
        except Exception as e:
            logger.error(f"Error generating presigned URL: {e}")
            raise
            
    async def delete_file(self, storage_path: str) -> bool:
        """
        Delete a file from storage
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=storage_path
            )
            return True
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            return False 