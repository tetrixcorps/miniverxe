import os
import json
import time
import logging
import hashlib
import asyncio
import numpy as np
from typing import Dict, Any, Optional, List, Tuple, Union
from app.core.metrics import MODEL_CACHE_HITS, MODEL_CACHE_MISSES

logger = logging.getLogger(__name__)

class ModelCache:
    """
    Cache for ML model inference results.
    
    This cache stores model inference results to enable offline inference
    and improve response times for repeated queries.
    """
    def __init__(self, 
                cache_dir: str = 'data/model_cache',
                max_size_mb: int = 512,  # 512 MB default
                ttl_seconds: int = 604800,  # 1 week default
                min_confidence: float = 0.8):  # Minimum confidence to cache
        self.cache_dir = cache_dir
        self.max_size_bytes = max_size_mb * 1024 * 1024
        self.ttl_seconds = ttl_seconds
        self.min_confidence = min_confidence
        self._init_cache()
        self._lock = asyncio.Lock()
        
    def _init_cache(self):
        """Initialize the cache storage"""
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # Create subdirectories for different model types
        model_types = ['text', 'image', 'audio', 'translation']
        for model_type in model_types:
            os.makedirs(os.path.join(self.cache_dir, model_type), exist_ok=True)
            
    def _get_cache_key(self, model_name: str, input_data: Union[str, bytes, Dict], 
                      params: Optional[Dict[str, Any]] = None) -> str:
        """Generate a unique cache key for the input"""
        # Convert input data to a hashable form
        if isinstance(input_data, dict):
            input_hash = hashlib.sha256(json.dumps(input_data, sort_keys=True).encode('utf-8')).hexdigest()
        elif isinstance(input_data, str):
            input_hash = hashlib.sha256(input_data.encode('utf-8')).hexdigest()
        elif isinstance(input_data, bytes):
            input_hash = hashlib.sha256(input_data).hexdigest()
        else:
            input_hash = hashlib.sha256(str(input_data).encode('utf-8')).hexdigest()
            
        # Include parameters in the key if provided
        param_str = ""
        if params:
            param_str = hashlib.sha256(json.dumps(params, sort_keys=True).encode('utf-8')).hexdigest()[:10]
            
        return f"{model_name}_{input_hash}_{param_str}"
    
    def _get_cache_path(self, model_type: str, cache_key: str) -> str:
        """Get the file path for a cache entry"""
        return os.path.join(self.cache_dir, model_type, f"{cache_key}.json")
    
    async def get(self, model_type: str, model_name: str, 
                input_data: Union[str, bytes, Dict], 
                params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """Get an item from the cache"""
        cache_key = self._get_cache_key(model_name, input_data, params)
        cache_path = self._get_cache_path(model_type, cache_key)
        
        try:
            if not os.path.exists(cache_path):
                MODEL_CACHE_MISSES.labels(model_name=model_name).inc()
                return None
                
            # Check if cache entry has expired
            file_stat = os.stat(cache_path)
            if time.time() - file_stat.st_mtime > self.ttl_seconds:
                # Cache entry has expired
                MODEL_CACHE_MISSES.labels(model_name=model_name).inc()
                return None
                
            # Read the cache entry
            async with self._lock:
                with open(cache_path, 'r') as f:
                    cache_data = json.load(f)
                    
            MODEL_CACHE_HITS.labels(model_name=model_name).inc()
            return cache_data.get('result')
            
        except Exception as e:
            logger.error(f"Error retrieving from cache: {e}")
            MODEL_CACHE_MISSES.labels(model_name=model_name).inc()
            return None
            
    async def set(self, model_type: str, model_name: str, 
                 input_data: Union[str, bytes, Dict], 
                 result: Dict[str, Any],
                 confidence: float = 1.0,
                 params: Optional[Dict[str, Any]] = None) -> bool:
        """Store an item in the cache"""
        # Don't cache low-confidence results
        if confidence < self.min_confidence:
            logger.debug(f"Not caching result with low confidence: {confidence}")
            return False
            
        cache_key = self._get_cache_key(model_name, input_data, params)
        cache_path = self._get_cache_path(model_type, cache_key)
        
        try:
            # Check if we need to clean up the cache
            await self._maybe_cleanup()
            
            # Store the cache entry
            cache_data = {
                'model_name': model_name,
                'model_type': model_type,
                'timestamp': time.time(),
                'confidence': confidence,
                'result': result
            }
            
            async with self._lock:
                with open(cache_path, 'w') as f:
                    json.dump(cache_data, f)
                    
            return True
            
        except Exception as e:
            logger.error(f"Error storing in cache: {e}")
            return False
            
    async def invalidate(self, model_type: str, model_name: str, 
                        input_data: Union[str, bytes, Dict],
                        params: Optional[Dict[str, Any]] = None) -> bool:
        """Invalidate a cache entry"""
        cache_key = self._get_cache_key(model_name, input_data, params)
        cache_path = self._get_cache_path(model_type, cache_key)
        
        if not os.path.exists(cache_path):
            return False
            
        try:
            async with self._lock:
                os.remove(cache_path)
            return True
        except Exception as e:
            logger.error(f"Error invalidating cache entry: {e}")
            return False
            
    async def clear(self, model_type: Optional[str] = None, 
                   model_name: Optional[str] = None) -> bool:
        """Clear cache entries matching the filters"""
        try:
            async with self._lock:
                if model_type and model_name:
                    # Clear cache for specific model
                    pattern = f"{model_name}_*"
                    for filename in os.listdir(os.path.join(self.cache_dir, model_type)):
                        if filename.startswith(f"{model_name}_") and filename.endswith('.json'):
                            os.remove(os.path.join(self.cache_dir, model_type, filename))
                elif model_type:
                    # Clear cache for model type
                    for filename in os.listdir(os.path.join(self.cache_dir, model_type)):
                        if filename.endswith('.json'):
                            os.remove(os.path.join(self.cache_dir, model_type, filename))
                else:
                    # Clear entire cache
                    for model_dir in os.listdir(self.cache_dir):
                        model_path = os.path.join(self.cache_dir, model_dir)
                        if os.path.isdir(model_path):
                            for filename in os.listdir(model_path):
                                if filename.endswith('.json'):
                                    os.remove(os.path.join(model_path, filename))
            return True
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            return False
            
    async def _maybe_cleanup(self):
        """Check cache size and clean up if necessary"""
        # Check current cache size
        total_size = 0
        file_info = []
        
        for root, _, files in os.walk(self.cache_dir):
            for file in files:
                if file.endswith('.json'):
                    file_path = os.path.join(root, file)
                    file_size = os.path.getsize(file_path)
                    file_mtime = os.path.getmtime(file_path)
                    total_size += file_size
                    file_info.append((file_path, file_size, file_mtime))
        
        # If cache is too big, remove oldest entries until it's under the limit
        if total_size > self.max_size_bytes:
            logger.info(f"Cache size ({total_size/1024/1024:.2f} MB) exceeds limit ({self.max_size_bytes/1024/1024:.2f} MB), cleaning up")
            
            # Sort by modification time (oldest first)
            file_info.sort(key=lambda x: x[2])
            
            async with self._lock:
                for file_path, file_size, _ in file_info:
                    os.remove(file_path)
                    total_size -= file_size
                    
                    if total_size <= self.max_size_bytes * 0.8:  # Clean up to 80% of max to avoid frequent cleanups
                        break 