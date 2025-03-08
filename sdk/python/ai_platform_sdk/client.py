"""
AI Client for server-side integration with the AI-Enhanced Microservices Platform.
"""

import os
import json
import time
import requests
from typing import Dict, List, Union, Optional, BinaryIO, Any
from urllib.parse import urljoin

from .exceptions import AIClientError, AuthenticationError, APIError
from .models import (
    TranscriptionOptions, 
    MediaEnhancementOptions,
    VisionAnalysisOptions,
    CallOptions,
    WebhookConfiguration
)

class AIClient:
    """Client for interacting with the AI-Enhanced Microservices Platform API."""

    def __init__(
        self, 
        base_url: str, 
        api_key: Optional[str] = None,
        auth_token: Optional[str] = None,
        timeout: int = 60
    ):
        """
        Initialize the AI client.

        Args:
            base_url: Base URL for the API
            api_key: Optional API key for authentication
            auth_token: Optional JWT token for authentication
            timeout: Request timeout in seconds
        """
        self.base_url = base_url
        self.api_key = api_key
        self.auth_token = auth_token
        self.timeout = timeout
        
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests."""
        headers = {"Content-Type": "application/json"}
        
        if self.api_key:
            headers["X-API-Key"] = self.api_key
            
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        return headers
    
    def _request(
        self, 
        method: str, 
        endpoint: str, 
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        files: Optional[Dict[str, BinaryIO]] = None,
        timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        """Make an API request."""
        url = urljoin(self.base_url, endpoint)
        timeout = timeout or self.timeout
        headers = self._get_headers()
        
        if files:
            # Remove Content-Type header for multipart form data
            headers.pop("Content-Type", None)
            
        try:
            response = requests.request(
                method=method,
                url=url,
                params=params,
                json=data,
                files=files,
                headers=headers,
                timeout=timeout
            )
            
            response.raise_for_status()
            
            if response.content:
                return response.json()
            return {}
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                raise AuthenticationError("Authentication failed")
            
            try:
                error_data = e.response.json()
                message = error_data.get("detail", str(e))
            except:
                message = str(e)
                
            raise APIError(message, status_code=e.response.status_code)
            
        except requests.exceptions.RequestException as e:
            raise AIClientError(f"Request failed: {str(e)}")
    
    # Authentication
    
    def login(self, username: str, password: str) -> Dict[str, Any]:
        """
        Log in with username and password.
        
        Args:
            username: User's username or email
            password: User's password
            
        Returns:
            Dict containing authentication tokens and user data
        """
        data = {"username": username, "password": password}
        result = self._request("POST", "/auth/login", data=data)
        
        if "access_token" in result:
            self.auth_token = result["access_token"]
            
        return result
    
    def register(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register a new user.
        
        Args:
            user_data: User registration data
            
        Returns:
            Dict containing registration confirmation
        """
        return self._request("POST", "/auth/register", data=user_data)
    
    def get_current_user(self) -> Dict[str, Any]:
        """
        Get current user information.
        
        Returns:
            Dict containing user profile data
        """
        return self._request("GET", "/api/me")
    
    # Speech Recognition
    
    def transcribe_audio(
        self, 
        audio_file: BinaryIO, 
        options: Optional[TranscriptionOptions] = None
    ) -> Dict[str, Any]:
        """
        Transcribe an audio file.
        
        Args:
            audio_file: Audio file to transcribe
            options: Transcription options
            
        Returns:
            Dict containing transcription results
        """
        options = options or TranscriptionOptions()
        files = {"file": audio_file}
        params = options.to_dict()
        
        return self._request("POST", "/api/asr/transcribe", params=params, files=files)
    
    def create_streaming_session(
        self, 
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a streaming transcription session.
        
        Args:
            options: Streaming options
            
        Returns:
            Dict containing session information with WebSocket URL
        """
        return self._request("POST", "/api/asr/streaming/create", data=options or {})
    
    # Vision Services
    
    def enhance_media(
        self, 
        image_file: BinaryIO, 
        options: Optional[MediaEnhancementOptions] = None
    ) -> Dict[str, Any]:
        """
        Enhance an image using super-resolution.
        
        Args:
            image_file: Image file to enhance
            options: Enhancement options
            
        Returns:
            Dict containing task information
        """
        options = options or MediaEnhancementOptions()
        files = {"file": image_file}
        params = options.to_dict()
        
        return self._request("POST", "/api/vision/enhance", params=params, files=files)
    
    def analyze_image(
        self, 
        image_file: BinaryIO, 
        options: Optional[VisionAnalysisOptions] = None
    ) -> Dict[str, Any]:
        """
        Analyze an image for objects, persons, etc.
        
        Args:
            image_file: Image file to analyze
            options: Analysis options
            
        Returns:
            Dict containing analysis results
        """
        options = options or VisionAnalysisOptions()
        files = {"file": image_file}
        params = options.to_dict()
        
        return self._request("POST", "/api/vision/analyze", params=params, files=files)
    
    # Background Tasks
    
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """
        Get status of a background task.
        
        Args:
            task_id: ID of the task to check
            
        Returns:
            Dict containing task status and results if completed
        """
        return self._request("GET", f"/api/background/tasks/{task_id}")
    
    def list_tasks(self, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        List background tasks.
        
        Args:
            options: Filtering options
            
        Returns:
            Dict containing list of tasks
        """
        return self._request("GET", "/api/background/tasks", params=options or {})
    
    # Marketing Services
    
    def analyze_campaign(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze marketing campaign.
        
        Args:
            campaign_data: Campaign data to analyze
            
        Returns:
            Dict containing analysis results or background task
        """
        return self._request("POST", "/api/marketing/campaigns/analyze", data=campaign_data)
    
    def score_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Score a lead based on their profile and activities.
        
        Args:
            lead_data: Lead data to score
            
        Returns:
            Dict containing lead score and recommendations
        """
        return self._request("POST", "/api/marketing/leads/score", data=lead_data)
    
    def register_marketing_webhook(
        self, 
        webhook_data: Union[Dict[str, Any], WebhookConfiguration]
    ) -> Dict[str, Any]:
        """
        Register marketing webhook for integration.
        
        Args:
            webhook_data: Webhook configuration
            
        Returns:
            Dict containing webhook registration confirmation
        """
        if isinstance(webhook_data, WebhookConfiguration):
            webhook_data = webhook_data.to_dict()
            
        return self._request("POST", "/api/marketing/webhook", data=webhook_data)
    
    # Sales Services
    
    def analyze_sales_call(self, call_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze sales call recording.
        
        Args:
            call_data: Call data including recording URL
            
        Returns:
            Dict containing analysis results or background task
        """
        return self._request("POST", "/api/sales/calls/analyze", data=call_data)
    
    def sync_opportunity(self, opportunity_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sync opportunity with CRM.
        
        Args:
            opportunity_data: Opportunity data to sync
            
        Returns:
            Dict containing sync confirmation
        """
        return self._request("POST", "/api/sales/crm/sync", data=opportunity_data)
    
    def get_opportunity_recommendations(self, opportunity_id: str) -> Dict[str, Any]:
        """
        Get opportunity recommendations.
        
        Args:
            opportunity_id: ID of the opportunity
            
        Returns:
            Dict containing AI-driven recommendations
        """
        return self._request("GET", f"/api/sales/opportunities/{opportunity_id}/recommendations")
    
    # VOIP Services
    
    def create_call(self, call_request: Union[Dict[str, Any], CallOptions]) -> Dict[str, Any]:
        """
        Create a new VOIP call.
        
        Args:
            call_request: Call creation request
            
        Returns:
            Dict containing call session details
        """
        if isinstance(call_request, CallOptions):
            call_request = call_request.to_dict()
            
        return self._request("POST", "/api/voip/calls", data=call_request)
    
    def end_call(self, call_id: str) -> Dict[str, Any]:
        """
        End an active VOIP call.
        
        Args:
            call_id: ID of the call to end
            
        Returns:
            Dict containing call end confirmation
        """
        return self._request("DELETE", f"/api/voip/calls/{call_id}")
    
    def get_call_analytics(self, call_id: str) -> Dict[str, Any]:
        """
        Get call analytics.
        
        Args:
            call_id: ID of the call to analyze
            
        Returns:
            Dict containing call analytics
        """
        return self._request("GET", f"/api/voip/calls/{call_id}/analytics")
    
    # General API Methods
    
    def get(
        self, 
        endpoint: str, 
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a GET request to any endpoint.
        
        Args:
            endpoint: API endpoint
            params: URL parameters
            
        Returns:
            Response data
        """
        return self._request("GET", endpoint, params=params)
    
    def post(
        self, 
        endpoint: str, 
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a POST request to any endpoint.
        
        Args:
            endpoint: API endpoint
            data: Request body
            
        Returns:
            Response data
        """
        return self._request("POST", endpoint, data=data)
    
    def put(
        self, 
        endpoint: str, 
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a PUT request to any endpoint.
        
        Args:
            endpoint: API endpoint
            data: Request body
            
        Returns:
            Response data
        """
        return self._request("PUT", endpoint, data=data)
    
    def delete(
        self, 
        endpoint: str
    ) -> Dict[str, Any]:
        """
        Make a DELETE request to any endpoint.
        
        Args:
            endpoint: API endpoint
            
        Returns:
            Response data
        """
        return self._request("DELETE", endpoint) 