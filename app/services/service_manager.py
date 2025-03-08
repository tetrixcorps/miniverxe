import asyncio
import signal
import time
from typing import Dict, List, Optional, Any
import logging
import json
import os
from app.services.background.worker import BackgroundWorker
from app.services.sync.data_sync import DataSyncService
from prometheus_client import Counter, Gauge, start_http_server

logger = logging.getLogger(__name__)

# Metrics for service management
SERVICE_METRICS = Counter(
    "service_operations_total",
    "Number of service operations",
    ["service", "operation", "status"]
)

SERVICE_STATUS = Gauge(
    "service_status",
    "Service status (1=running, 0=stopped)",
    ["service"]
)

class ServiceManager:
    """
    Coordinates and manages background services.
    
    This manager ensures services can run independently of the main application,
    providing resilience during network outages or system restarts.
    """
    def __init__(self, 
                data_dir: str = 'data',
                metrics_port: int = 8001,
                services_config: str = 'config/services.json'):
        self.data_dir = data_dir
        self.metrics_port = metrics_port
        self.services_config = services_config
        self.background_worker = BackgroundWorker(storage_dir=os.path.join(data_dir, 'tasks'))
        self.data_sync = DataSyncService(storage_dir=os.path.join(data_dir, 'sync'))
        self.services = {
            'background_worker': self.background_worker,
            'data_sync': self.data_sync
        }
        self.custom_services = {}
        self.running = False
        self._shutdown_event = asyncio.Event()
        self._initialize()
        
    def _initialize(self):
        """Initialize the service manager"""
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Load service configuration if available
        if os.path.exists(self.services_config):
            try:
                with open(self.services_config, 'r') as f:
                    config = json.load(f)
                    
                    # Configure worker from config
                    if 'background_worker' in config:
                        worker_config = config['background_worker']
                        self.background_worker = BackgroundWorker(
                            max_workers=worker_config.get('max_workers', 4),
                            poll_interval=worker_config.get('poll_interval', 0.1),
                            task_timeout=worker_config.get('task_timeout', 600.0),
                            storage_dir=os.path.join(self.data_dir, 'tasks')
                        )
                        
                    # Configure data sync from config
                    if 'data_sync' in config:
                        sync_config = config['data_sync']
                        self.data_sync = DataSyncService(
                            storage_dir=os.path.join(self.data_dir, 'sync'),
                            retry_interval=sync_config.get('retry_interval', 30.0),
                            max_retries=sync_config.get('max_retries', 10),
                            batch_size=sync_config.get('batch_size', 50)
                        )
                        
                    # Update services dict
                    self.services = {
                        'background_worker': self.background_worker,
                        'data_sync': self.data_sync
                    }
            except Exception as e:
                logger.error(f"Error loading services config: {e}")
    
    def register_task_handler(self, task_type: str, handler):
        """Register a task handler with the background worker"""
        self.background_worker.register_handler(task_type, handler)
        return self
    
    def register_custom_service(self, name: str, service):
        """Register a custom service with the service manager"""
        if hasattr(service, 'start') and hasattr(service, 'stop'):
            self.custom_services[name] = service
            self.services[name] = service
            return self
        else:
            raise ValueError("Custom service must have start() and stop() methods")
    
    async def start(self):
        """Start all services"""
        self.running = True
        
        # Start metrics server
        start_http_server(self.metrics_port)
        logger.info(f"Started metrics server on port {self.metrics_port}")
        
        # Set up signal handlers
        self._setup_signal_handlers()
        
        # Start all services
        for name, service in self.services.items():
            try:
                logger.info(f"Starting service: {name}")
                await service.start()
                SERVICE_STATUS.labels(service=name).set(1)
                SERVICE_METRICS.labels(service=name, operation="start", status="success").inc()
            except Exception as e:
                logger.error(f"Error starting service {name}: {e}")
                SERVICE_METRICS.labels(service=name, operation="start", status="error").inc()
        
        # Keep running until shutdown is requested
        await self._shutdown_event.wait()
        
        # Stop all services
        await self.stop()
    
    def _setup_signal_handlers(self):
        """Set up signal handlers for graceful shutdown"""
        loop = asyncio.get_event_loop()
        
        # Register signal handlers
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, lambda s=sig: asyncio.create_task(self._handle_signal(s)))
    
    async def _handle_signal(self, sig):
        """Handle signals for graceful shutdown"""
        logger.info(f"Received signal {sig.name}, shutting down...")
        self._shutdown_event.set()
    
    async def stop(self):
        """Stop all services"""
        self.running = False
        
        # Stop services in reverse order
        for name, service in reversed(list(self.services.items())):
            try:
                logger.info(f"Stopping service: {name}")
                await service.stop()
                SERVICE_STATUS.labels(service=name).set(0)
                SERVICE_METRICS.labels(service=name, operation="stop", status="success").inc()
            except Exception as e:
                logger.error(f"Error stopping service {name}: {e}")
                SERVICE_METRICS.labels(service=name, operation="stop", status="error").inc()
    
    async def enqueue_task(self, task_type: str, payload: Dict[str, Any]) -> str:
        """Enqueue a task for background processing"""
        return await self.background_worker.enqueue(task_type, payload)
    
    async def queue_for_sync(self, sync_type: str, data: Dict[str, Any]) -> bool:
        """Queue data for synchronization"""
        return await self.data_sync.queue_for_sync(sync_type, data)
    
    async def wait_for_task(self, task_id: str, timeout: float = None) -> Optional[Dict[str, Any]]:
        """Wait for a specific task to complete"""
        start_time = time.time()
        
        while True:
            # Check if the task is completed
            completed_path = os.path.join(self.data_dir, 'tasks', 'completed', f'{task_id}.json')
            if os.path.exists(completed_path):
                with open(completed_path, 'r') as f:
                    task_info = json.load(f)
                
                # Load result from result file if needed
                if isinstance(task_info.get('result'), str) and task_info['result'].startswith('results/'):
                    result_file = os.path.join(self.data_dir, 'tasks', task_info['result'])
                    if os.path.exists(result_file):
                        with open(result_file, 'r') as f:
                            task_info['result'] = json.load(f)
                
                return task_info
            
            # Check if the task failed
            failed_path = os.path.join(self.data_dir, 'tasks', 'failed', f'{task_id}.json')
            if os.path.exists(failed_path):
                with open(failed_path, 'r') as f:
                    return json.load(f)
            
            # Check timeout
            if timeout is not None and time.time() - start_time > timeout:
                return None
            
            # Wait a bit before checking again
            await asyncio.sleep(0.1)
    
    def get_service_status(self) -> Dict[str, Dict[str, Any]]:
        """Get the status of all services"""
        status = {}
        
        for name in self.services:
            service_status = 1 if SERVICE_STATUS.labels(service=name)._value.get() else 0
            status[name] = {
                "running": service_status == 1,
                "status": "running" if service_status == 1 else "stopped"
            }
        
        return {
            "status": "success",
            "records_processed": 42,
            "processed_at": time.time()
        } 