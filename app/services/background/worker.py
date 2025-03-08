import asyncio
import os
import signal
import time
import json
import logging
import uuid
from typing import Dict, Any, Callable, Awaitable, Optional, List, Union
from concurrent.futures import ThreadPoolExecutor
import threading
from prometheus_client import Counter, Gauge, Histogram

logger = logging.getLogger(__name__)

# Metrics for monitoring background tasks
TASK_METRICS = Counter(
    "background_tasks_total", 
    "Number of background tasks processed",
    ["task_type", "status"]
)

TASK_DURATION = Histogram(
    "background_task_duration_seconds",
    "Time taken to process background tasks",
    ["task_type"]
)

QUEUE_SIZE = Gauge(
    "background_queue_size", 
    "Number of tasks in the background queue",
    ["queue_name"]
)

class BackgroundWorker:
    """
    A resilient worker that processes tasks in the background.
    
    This worker can continue processing tasks even when the main application
    appears offline or network connectivity is lost.
    """
    def __init__(self, 
                max_workers: int = 4,
                poll_interval: float = 0.1,
                task_timeout: float = 600.0,
                storage_dir: str = 'data/tasks'):
        self.max_workers = max_workers
        self.poll_interval = poll_interval
        self.task_timeout = task_timeout
        self.storage_dir = storage_dir
        self.task_handlers: Dict[str, Callable] = {}
        self.queues: Dict[str, List[Dict[str, Any]]] = {}
        self.running = False
        self.processing_tasks: Dict[str, asyncio.Task] = {}
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self._setup_storage()
        self._lock = threading.RLock()
        
    def _setup_storage(self):
        """Set up persistent storage for tasks"""
        os.makedirs(self.storage_dir, exist_ok=True)
        
        # Create queue directories if they don't exist
        queues_dir = os.path.join(self.storage_dir, 'queues')
        os.makedirs(queues_dir, exist_ok=True)
        
        # Load existing queues
        self._load_persisted_queues()
        
    def _load_persisted_queues(self):
        """Load persisted queues from disk"""
        queues_dir = os.path.join(self.storage_dir, 'queues')
        for queue_file in os.listdir(queues_dir):
            if queue_file.endswith('.json'):
                queue_name = queue_file[:-5]  # Remove .json extension
                self.queues[queue_name] = []
                try:
                    with open(os.path.join(queues_dir, queue_file), 'r') as f:
                        tasks = json.load(f)
                        for task in tasks:
                            self.queues[queue_name].append(task)
                            QUEUE_SIZE.labels(queue_name=queue_name).inc()
                except Exception as e:
                    logger.error(f"Error loading queue {queue_name}: {e}")
    
    def _persist_queue(self, queue_name: str):
        """Persist a queue to disk"""
        queue_file = os.path.join(self.storage_dir, 'queues', f'{queue_name}.json')
        with open(queue_file, 'w') as f:
            json.dump(self.queues[queue_name], f)
    
    def register_handler(self, task_type: str, handler: Callable[[Dict[str, Any]], Any]):
        """Register a handler for a specific task type"""
        self.task_handlers[task_type] = handler
        if task_type not in self.queues:
            self.queues[task_type] = []
        return self
    
    async def start(self):
        """Start the background worker"""
        self.running = True
        await self._process_queues()
    
    async def stop(self):
        """Stop the background worker"""
        self.running = False
        
        # Wait for all processing tasks to complete
        if self.processing_tasks:
            await asyncio.gather(*self.processing_tasks.values(), return_exceptions=True)
        
        # Persist all queues
        for queue_name in self.queues:
            self._persist_queue(queue_name)
        
        # Shutdown thread pool
        self.executor.shutdown(wait=True)
    
    async def enqueue(self, task_type: str, payload: Dict[str, Any]) -> str:
        """Add a task to the queue"""
        if task_type not in self.queues:
            self.queues[task_type] = []
            
        task_id = str(uuid.uuid4())
        task = {
            'id': task_id,
            'type': task_type,
            'payload': payload,
            'created_at': time.time(),
            'attempts': 0,
            'status': 'pending'
        }
        
        with self._lock:
            self.queues[task_type].append(task)
            QUEUE_SIZE.labels(queue_name=task_type).inc()
            self._persist_queue(task_type)
        
        logger.info(f"Enqueued task {task_id} of type {task_type}")
        return task_id
    
    async def _process_queues(self):
        """Process all queues in parallel"""
        while self.running:
            for queue_name, queue in list(self.queues.items()):
                if not queue:
                    await asyncio.sleep(0)
                    continue
                    
                # Process the next task in the queue
                with self._lock:
                    task = queue[0]
                    
                # Skip tasks that are already being processed
                if task['id'] in self.processing_tasks:
                    await asyncio.sleep(0)
                    continue
                
                # Process the task
                process_task = asyncio.create_task(self._process_task(queue_name, task))
                self.processing_tasks[task['id']] = process_task
                
                # Set up a callback to clean up when the task is done
                process_task.add_done_callback(
                    lambda fut, task_id=task['id']: self.processing_tasks.pop(task_id, None)
                )
                
            await asyncio.sleep(self.poll_interval)
    
    async def _process_task(self, queue_name: str, task: Dict[str, Any]):
        """Process a single task"""
        task_id = task['id']
        task_type = task['type']
        payload = task['payload']
        
        if task_type not in self.task_handlers:
            logger.error(f"No handler registered for task type {task_type}")
            with self._lock:
                self.queues[queue_name].remove(task)
                QUEUE_SIZE.labels(queue_name=queue_name).dec()
                self._persist_queue(queue_name)
            TASK_METRICS.labels(task_type=task_type, status="no_handler").inc()
            return
        
        handler = self.task_handlers[task_type]
        
        # Update task status
        task['status'] = 'processing'
        task['started_at'] = time.time()
        task['attempts'] += 1
        
        try:
            # Measure task processing time
            start_time = time.time()
            
            # Execute the handler
            result = await self._execute_handler(handler, payload)
            
            # Record metrics
            duration = time.time() - start_time
            TASK_DURATION.labels(task_type=task_type).observe(duration)
            TASK_METRICS.labels(task_type=task_type, status="success").inc()
            
            # Update task status
            task['status'] = 'completed'
            task['completed_at'] = time.time()
            task['result'] = result
            
            # Write result to a separate file for larger results
            result_file = os.path.join(self.storage_dir, 'results', f'{task_id}.json')
            os.makedirs(os.path.dirname(result_file), exist_ok=True)
            with open(result_file, 'w') as f:
                json.dump(result, f)
            
            logger.info(f"Task {task_id} of type {task_type} completed successfully")
        except Exception as e:
            logger.error(f"Error processing task {task_id}: {e}")
            
            # Update task status
            task['status'] = 'failed'
            task['error'] = str(e)
            task['failed_at'] = time.time()
            
            # Record error in metrics
            TASK_METRICS.labels(task_type=task_type, status="failed").inc()
        
        # Remove task from queue
        with self._lock:
            if task in self.queues[queue_name]:
                self.queues[queue_name].remove(task)
                QUEUE_SIZE.labels(queue_name=queue_name).dec()
            self._persist_queue(queue_name)
        
        # Store completed or failed task
        task_dir = os.path.join(self.storage_dir, task['status'])
        os.makedirs(task_dir, exist_ok=True)
        with open(os.path.join(task_dir, f'{task_id}.json'), 'w') as f:
            # Store task metadata but point to result file for the actual result
            task_copy = task.copy()
            if 'result' in task_copy:
                task_copy['result'] = f'results/{task_id}.json'
            json.dump(task_copy, f)
            
    async def _execute_handler(self, handler: Callable, payload: Dict[str, Any]) -> Any:
        """Execute a task handler with the given payload"""
        if asyncio.iscoroutinefunction(handler):
            return await handler(payload)
        else:
            return handler(payload) 