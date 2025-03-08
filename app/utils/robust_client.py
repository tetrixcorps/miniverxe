import os
import json
import time
import logging
import uuid
import aiohttp
import asyncio
from typing import Dict, Any, Optional, List, Callable, Union
from datetime import datetime
import hashlib

logger = logging.getLogger(__name__)

class RobustAPIClient:
    """
    A client for making API requests that can handle offline scenarios.
    
    This client will queue requests when the network is unavailable and 
    automatically retry them when connectivity is restored.
    """
    def __init__(self, 
                base_url: str, 
                cache_dir: str = 'data/client_cache',
                request_queue_dir: str = 'data/request_queue',
                retry_interval: float = 30.0,
                max_retries: int = 10):
        self.base_url = base_url.rstrip('/')
        self.cache_dir = cache_dir
        self.request_queue_dir = request_queue_dir
        self.retry_interval = retry_interval
        self.max_retries = max_retries
        self.session: Optional[aiohttp.ClientSession] = None
        self.offline_mode = False
        self.online_callbacks: List[Callable] = []
        self.offline_callbacks: List[Callable] = []
        self._setup_storage()
        
    def _setup_storage(self):
        """Set up storage directories"""
        os.makedirs(self.cache_dir, exist_ok=True)
        os.makedirs(self.request_queue_dir, exist_ok=True)
        
        # Create subdirectories for different types of cached data
        os.makedirs(os.path.join(self.cache_dir, 'responses'), exist_ok=True)
        
        # Create directories for the request queue
        os.makedirs(os.path.join(self.request_queue_dir, 'pending'), exist_ok=True)
        os.makedirs(os.path.join(self.request_queue_dir, 'in_progress'), exist_ok=True)
        os.makedirs(os.path.join(self.request_queue_dir, 'failed'), exist_ok=True)
        
    async def start(self):
        """Start the client and background processes"""
        self.session = aiohttp.ClientSession()
        asyncio.create_task(self._background_sync())
        
    async def stop(self):
        """Stop the client and background processes"""
        if self.session:
            await self.session.close()
            self.session = None
            
    def register_online_callback(self, callback: Callable):
        """Register a callback to be called when online status is regained"""
        self.online_callbacks.append(callback)
        
    def register_offline_callback(self, callback: Callable):
        """Register a callback to be called when going offline"""
        self.offline_callbacks.append(callback)
        
    def _generate_cache_key(self, method: str, url: str, data: Optional[Any] = None) -> str:
        """Generate a cache key for a request"""
        key_parts = [method.upper(), url]
        
        if data:
            if isinstance(data, (dict, list)):
                key_parts.append(json.dumps(data, sort_keys=True))
            else:
                key_parts.append(str(data))
                
        key_string = "::".join(key_parts)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def _get_cached_response(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get a cached response"""
        cache_file = os.path.join(self.cache_dir, 'responses', f"{cache_key}.json")
        
        if os.path.exists(cache_file):
            try:
                with open(cache_file, 'r') as f:
                    cached_data = json.load(f)
                    
                # Check if the cache has expired
                if 'expires_at' in cached_data:
                    if time.time() > cached_data['expires_at']:
                        # Cache has expired
                        return None
                        
                logger.debug(f"Cache hit for key {cache_key}")
                return cached_data.get('response')
            
            except Exception as e:
                logger.error(f"Error reading cache file: {e}")
                
        return None
    
    def _save_to_cache(self, cache_key: str, response: Dict[str, Any], ttl: Optional[int] = None):
        """Save a response to the cache"""
        cache_file = os.path.join(self.cache_dir, 'responses', f"{cache_key}.json")
        
        expires_at = None
        if ttl is not None:
            expires_at = time.time() + ttl
            
        cache_data = {
            'response': response,
            'cached_at': time.time(),
            'expires_at': expires_at
        }
        
        try:
            with open(cache_file, 'w') as f:
                json.dump(cache_data, f)
                
            logger.debug(f"Saved response to cache with key {cache_key}")
        
        except Exception as e:
            logger.error(f"Error saving to cache: {e}")
    
    def _queue_request(self, method: str, url: str, data: Optional[Any] = None, 
                      headers: Optional[Dict[str, str]] = None, **kwargs) -> str:
        """Queue a request for later processing"""
        request_id = str(uuid.uuid4())
        
        request_data = {
            'id': request_id,
            'method': method.upper(),
            'url': url,
            'data': data,
            'headers': headers or {},
            'kwargs': kwargs,
            'queued_at': time.time(),
            'attempts': 0
        }
        
        queue_file = os.path.join(self.request_queue_dir, 'pending', f"{request_id}.json")
        
        try:
            with open(queue_file, 'w') as f:
                json.dump(request_data, f)
                
            logger.info(f"Queued request {request_id} for later processing")
            
        except Exception as e:
            logger.error(f"Error queuing request: {e}")
            
        return request_id
    
    async def request(self, method: str, path: str, data: Optional[Any] = None,
                      headers: Optional[Dict[str, str]] = None, use_cache: bool = False,
                      cache_ttl: Optional[int] = None, **kwargs) -> Dict[str, Any]:
        """
        Make an API request with offline handling.
        
        If the service is offline, the request will be queued for later processing.
        If use_cache is True, cached responses will be used when available.
        """
        url = f"{self.base_url}{path}"
        cache_key = None
        
        if use_cache:
            cache_key = self._generate_cache_key(method, url, data)
            cached_response = self._get_cached_response(cache_key)
            
            if cached_response is not None:
                return cached_response
                
        if self.offline_mode or self.session is None:
            logger.info(f"In offline mode, queuing request: {method} {path}")
            request_id = self._queue_request(method, path, data, headers, **kwargs)
            
            # Return a placeholder response
            return {
                'status': 'queued',
                'message': 'Request queued for processing when online',
                'request_id': request_id
            }
            
        # We're online, make the request
        try:
            async with getattr(self.session, method.lower())(
                url, json=data, headers=headers, **kwargs) as response:
                
                response_data = await response.json()
                
                # Cache the response if requested
                if use_cache and cache_key and response.status == 200:
                    self._save_to_cache(cache_key, response_data, cache_ttl)
                    
                return response_data
                
        except (aiohttp.ClientError, asyncio.TimeoutError) as e:
            logger.error(f"Request failed, switching to offline mode: {e}")
            self.offline_mode = True
            
            # Notify offline callbacks
            for callback in self.offline_callbacks:
                try:
                    callback()
                except Exception as cb_e:
                    logger.error(f"Error in offline callback: {cb_e}")
            
            # Queue the request for later
            request_id = self._queue_request(method, path, data, headers, **kwargs)
            
            # Return a placeholder response
            return {
                'status': 'queued',
                'message': 'Request queued for processing when online',
                'request_id': request_id
            }
    
    async def _background_sync(self):
        """Background process to sync queued requests"""
        while True:
            if not self.session:
                await asyncio.sleep(self.retry_interval)
                continue
                
            # Try to process queued requests if we might be online
            if not self.offline_mode:
                try:
                    await self._process_queued_requests()
                except Exception as e:
                    logger.error(f"Error processing queued requests: {e}")
            
            # Check if we're online
            try:
                async with self.session.get(f"{self.base_url}/health") as response:
                    if response.status == 200:
                        # We're online
                        if self.offline_mode:
                            logger.info("Connectivity restored, switching to online mode")
                            self.offline_mode = False
                            
                            # Notify online callbacks
                            for callback in self.online_callbacks:
                                try:
                                    callback()
                                except Exception as cb_e:
                                    logger.error(f"Error in online callback: {cb_e}")
                            
                            # Process queued requests
                            await self._process_queued_requests()
            except:
                if not self.offline_mode:
                    logger.info("Connectivity lost, switching to offline mode")
                    self.offline_mode = True
                    
                    # Notify offline callbacks
                    for callback in self.offline_callbacks:
                        try:
                            callback()
                        except Exception as cb_e:
                            logger.error(f"Error in offline callback: {cb_e}")
            
            await asyncio.sleep(self.retry_interval)
    
    async def _process_queued_requests(self):
        """Process queued requests"""
        pending_dir = os.path.join(self.request_queue_dir, 'pending')
        in_progress_dir = os.path.join(self.request_queue_dir, 'in_progress')
        failed_dir = os.path.join(self.request_queue_dir, 'failed')
        
        # Process each queued request
        for filename in os.listdir(pending_dir):
            if not filename.endswith('.json'):
                continue
                
            request_path = os.path.join(pending_dir, filename)
            in_progress_path = os.path.join(in_progress_dir, filename)
            failed_path = os.path.join(failed_dir, filename)
            
            try:
                # Move to in_progress
                with open(request_path, 'r') as f:
                    request_data = json.load(f)
                    
                # Move to in progress
                os.rename(request_path, in_progress_path)
                
                # Increment attempt count
                request_data['attempts'] += 1
                
                # Skip if too many attempts
                if request_data['attempts'] > self.max_retries:
                    logger.warning(f"Request {request_data['id']} exceeded max retries")
                    
                    # Move to failed
                    os.rename(in_progress_path, failed_path)
                    continue
                
                # Make the request
                method = request_data['method'].lower()
                url = request_data['url']
                data = request_data.get('data')
                headers = request_data.get('headers', {})
                kwargs = request_data.get('kwargs', {})
                
                try:
                    async with getattr(self.session, method)(
                        url, json=data, headers=headers, **kwargs) as response:
                        
                        if response.status in (200, 201, 202, 204):
                            # Request succeeded, remove from queue
                            os.remove(in_progress_path)
                            logger.info(f"Successfully processed queued request {request_data['id']}")
                        else:
                            # Request failed, increment attempt count and move back to pending
                            with open(in_progress_path, 'w') as f:
                                json.dump(request_data, f)
                                
                            os.rename(in_progress_path, request_path)
                            logger.warning(f"Request failed with status {response.status}, will retry later")
                
                except Exception as e:
                    # Network error, move back to pending to retry later
                    logger.error(f"Error processing request {request_data['id']}: {e}")
                    
                    with open(in_progress_path, 'w') as f:
                        json.dump(request_data, f)
                        
                    os.rename(in_progress_path, request_path)
                    
                    # We might be offline again
                    self.offline_mode = True
                    break
            
            except Exception as e:
                logger.error(f"Error processing queued request file {filename}: {e}")
                
                # Try to move back to pending
                try:
                    if os.path.exists(in_progress_path):
                        os.rename(in_progress_path, request_path)
                except:
                    pass

    # Convenience methods for common HTTP methods
    async def get(self, path: str, **kwargs):
        return await self.request('GET', path, **kwargs)
        
    async def post(self, path: str, data: Dict[str, Any] = None, **kwargs):
        return await self.request('POST', path, data, **kwargs)
        
    async def put(self, path: str, data: Dict[str, Any] = None, **kwargs):
        return await self.request('PUT', path, data, **kwargs)
        
    async def delete(self, path: str, **kwargs):
        return await self.request('DELETE', path, **kwargs) 