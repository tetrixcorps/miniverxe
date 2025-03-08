import asyncio
import time
import json
from typing import Dict, List, Any, Optional
import logging
import os
import aiohttp
import tempfile
from prometheus_client import Counter, Histogram, Gauge

logger = logging.getLogger(__name__)

# Metrics for sync operations
SYNC_METRICS = Counter(
    "sync_operations_total",
    "Number of synchronization operations",
    ["type", "action", "status"]
)

SYNC_DURATION = Histogram(
    "sync_duration_seconds",
    "Time taken for synchronization operations",
    ["type"]
)

SYNC_QUEUE_SIZE = Gauge(
    "sync_queue_size",
    "Number of items waiting to be synchronized",
    ["type"]
)

class DataSyncService:
    """
    Service for synchronizing data between the local system and remote servers.
    
    This service ensures data is synchronized when connectivity is restored,
    allowing the application to function offline and then sync when back online.
    """
    def __init__(self, 
                 storage_dir: str = 'data/sync',
                 retry_interval: float = 30.0,
                 max_retries: int = 10,
                 batch_size: int = 50):
        self.storage_dir = storage_dir
        self.retry_interval = retry_interval
        self.max_retries = max_retries
        self.batch_size = batch_size
        self.sync_types = ['model_data', 'metrics', 'logs', 'user_feedback', 'config']
        self.sync_queues: Dict[str, List[Dict[str, Any]]] = {}
        self.running = False
        self.sync_session: Optional[aiohttp.ClientSession] = None
        self._initialize_storage()

    def _initialize_storage(self):
        """Initialize storage directories for sync data"""
        os.makedirs(self.storage_dir, exist_ok=True)
        
        # Create directories for different sync types
        for sync_type in self.sync_types:
            os.makedirs(os.path.join(self.storage_dir, sync_type), exist_ok=True)
            
            # Initialize sync queues
            self.sync_queues[sync_type] = []
            
            # Load existing sync items
            self._load_sync_items(sync_type)
            
    def _load_sync_items(self, sync_type: str):
        """Load existing sync items from disk"""
        sync_dir = os.path.join(self.storage_dir, sync_type)
        for filename in os.listdir(sync_dir):
            if filename.endswith('.json'):
                try:
                    with open(os.path.join(sync_dir, filename), 'r') as f:
                        item = json.load(f)
                        self.sync_queues[sync_type].append(item)
                        SYNC_QUEUE_SIZE.labels(type=sync_type).inc()
                except Exception as e:
                    logger.error(f"Error loading sync item {filename}: {e}")
    
    def _save_sync_item(self, sync_type: str, item: Dict[str, Any]):
        """Save a sync item to disk"""
        item_id = item.get('id', str(time.time()))
        item_path = os.path.join(self.storage_dir, sync_type, f'{item_id}.json')
        
        with open(item_path, 'w') as f:
            json.dump(item, f)
    
    def _remove_sync_item(self, sync_type: str, item: Dict[str, Any]):
        """Remove a sync item from disk"""
        item_id = item.get('id', '')
        item_path = os.path.join(self.storage_dir, sync_type, f'{item_id}.json')
        
        if os.path.exists(item_path):
            os.remove(item_path)
    
    async def start(self):
        """Start the synchronization service"""
        self.running = True
        self.sync_session = aiohttp.ClientSession()
        await self._sync_loop()
    
    async def stop(self):
        """Stop the synchronization service"""
        self.running = False
        if self.sync_session:
            await self.sync_session.close()
            self.sync_session = None
    
    async def queue_for_sync(self, sync_type: str, data: Dict[str, Any]):
        """Queue data for synchronization"""
        if sync_type not in self.sync_types:
            logger.error(f"Unknown sync type: {sync_type}")
            return False
        
        item = {
            'id': data.get('id', str(time.time())),
            'type': sync_type,
            'data': data,
            'queued_at': time.time(),
            'attempts': 0
        }
        
        self.sync_queues[sync_type].append(item)
        SYNC_QUEUE_SIZE.labels(type=sync_type).inc()
        self._save_sync_item(sync_type, item)
        
        logger.info(f"Queued item for sync: {sync_type}/{item['id']}")
        return True
    
    async def _sync_loop(self):
        """Main synchronization loop"""
        while self.running:
            for sync_type in self.sync_types:
                if not self.sync_queues[sync_type]:
                    continue
                
                # Process items in batches
                items_to_process = self.sync_queues[sync_type][:self.batch_size]
                
                # Measure sync time
                start_time = time.time()
                
                # Try to sync items
                try:
                    success_items = await self._sync_items(sync_type, items_to_process)
                    
                    # Remove successful items from queue
                    for item in success_items:
                        if item in self.sync_queues[sync_type]:
                            self.sync_queues[sync_type].remove(item)
                            SYNC_QUEUE_SIZE.labels(type=sync_type).dec()
                            self._remove_sync_item(sync_type, item)
                    
                    # Record metrics
                    duration = time.time() - start_time
                    SYNC_DURATION.labels(type=sync_type).observe(duration)
                    SYNC_METRICS.labels(type=sync_type, action="sync", status="success").inc(len(success_items))
                    
                    if success_items:
                        logger.info(f"Synchronized {len(success_items)} items of type {sync_type}")
                
                except Exception as e:
                    logger.error(f"Error during sync of type {sync_type}: {e}")
                    SYNC_METRICS.labels(type=sync_type, action="sync", status="error").inc()
            
            # Wait before next sync attempt
            await asyncio.sleep(self.retry_interval)
    
    async def _sync_items(self, sync_type: str, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Synchronize a batch of items"""
        if not self.sync_session:
            return []
        
        success_items = []
        
        for item in items:
            # Increment attempt count
            item['attempts'] += 1
            self._save_sync_item(sync_type, item)
            
            # Skip items that have exceeded max retries
            if item['attempts'] > self.max_retries:
                logger.warning(f"Item {item['id']} of type {sync_type} exceeded max retries")
                SYNC_METRICS.labels(type=sync_type, action="sync", status="max_retries").inc()
                continue
            
            # Try to sync the item
            try:
                if sync_type == 'model_data':
                    await self._sync_model_data(item)
                elif sync_type == 'metrics':
                    await self._sync_metrics(item)
                elif sync_type == 'logs':
                    await self._sync_logs(item)
                elif sync_type == 'user_feedback':
                    await self._sync_user_feedback(item)
                elif sync_type == 'config':
                    await self._sync_config(item)
                
                # If we got here, sync was successful
                success_items.append(item)
            
            except Exception as e:
                logger.error(f"Error syncing item {item['id']} of type {sync_type}: {e}")
                # We'll retry this item in the next sync loop
        
        return success_items
    
    async def _sync_model_data(self, item: Dict[str, Any]):
        """Sync model data to remote storage"""
        model_data = item['data']
        
        # This would typically upload model data to S3, GCS, or similar
        # For now, we'll just simulate a successful sync
        await asyncio.sleep(0.1)  # Simulate network operation
        
        # In a real implementation, you'd have code like:
        # async with self.sync_session.put(model_data['upload_url'], data=model_data['data']) as response:
        #     if response.status != 200:
        #         raise Exception(f"Failed to upload model data: {await response.text()}")
    
    async def _sync_metrics(self, item: Dict[str, Any]):
        """Sync metrics to monitoring system"""
        metrics_data = item['data']
        
        # This would typically send metrics to a monitoring system like Prometheus
        await asyncio.sleep(0.05)  # Simulate network operation
    
    async def _sync_logs(self, item: Dict[str, Any]):
        """Sync logs to log aggregation system"""
        log_data = item['data']
        
        # This would typically send logs to a system like ELK
        await asyncio.sleep(0.02)  # Simulate network operation
    
    async def _sync_user_feedback(self, item: Dict[str, Any]):
        """Sync user feedback to analytics system"""
        feedback_data = item['data']
        
        # This would send user feedback to an analytics system
        await asyncio.sleep(0.1)  # Simulate network operation
    
    async def _sync_config(self, item: Dict[str, Any]):
        """Sync configuration updates"""
        config_type = item['data'].get('config_type', 'unknown')
        update_data = item['data'].get('update', {})
        
        # Here you would update application configuration
        # This is just a placeholder
        ConfigManager().update_config(config_type, update_data.get("config", {}))
        SYNC_METRICS.labels(type="config_update", action="processed").inc() 