#!/usr/bin/env python3
"""
Recovery script to ensure all services are running and healthy.
This can be run as a cron job or system service.
"""

import os
import sys
import json
import time
import datetime
import logging
import argparse
import subprocess
import asyncio
import signal
import psutil
from typing import Dict, List, Any, Optional

# Add the parent directory to sys.path to import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.service_manager import ServiceManager
from app.core.metrics import SERVICE_HEALTH

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join('logs', 'recovery.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('recovery')

class RecoveryManager:
    """
    Manages the recovery of services after system failures or network outages.
    Ensures all services are running and processes any queued tasks.
    """
    def __init__(self, config_path='config/recovery.json'):
        self.config_path = config_path
        self.config = self._load_config()
        self.service_manager = None
        
    def _load_config(self) -> Dict[str, Any]:
        """Load recovery configuration"""
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading recovery config: {e}")
        
        # Default configuration
        return {
            "services": {
                "background_worker": {
                    "enabled": True,
                    "process_name": "python3 -m app.services.background.worker",
                    "restart_command": "systemctl restart ml-service-worker"
                },
                "data_sync": {
                    "enabled": True,
                    "process_name": "python3 -m app.services.sync.data_sync",
                    "restart_command": "systemctl restart ml-service-sync"
                },
                "api": {
                    "enabled": True,
                    "process_name": "uvicorn app.main:app",
                    "restart_command": "systemctl restart ml-service-api"
                }
            },
            "max_retries": 3,
            "retry_interval": 5,
            "cleanup": {
                "enabled": True,
                "max_age_days": 7,
                "max_failed_tasks": 1000
            }
        }
    
    async def run(self):
        """Run the recovery process"""
        logger.info("Starting recovery process")
        
        # Check services
        await self._check_services()
        
        # Check and process stalled tasks
        await self._check_stalled_tasks()
        
        # Clean up old data
        if self.config.get("cleanup", {}).get("enabled", True):
            await self._cleanup_old_data()
        
        logger.info("Recovery process completed")
    
    async def _check_services(self):
        """Check if services are running and restart if needed"""
        logger.info("Checking services")
        
        services = self.config.get("services", {})
        
        for service_name, service_config in services.items():
            if not service_config.get("enabled", True):
                logger.info(f"Service {service_name} is disabled, skipping")
                continue
            
            logger.info(f"Checking service: {service_name}")
            
            # Check if the service is running
            is_running = self._check_service_running(service_config.get("process_name", ""))
            
            if is_running:
                logger.info(f"Service {service_name} is running")
                SERVICE_HEALTH.labels(service_name=service_name).set(1)
            else:
                logger.warning(f"Service {service_name} is not running, attempting to restart")
                SERVICE_HEALTH.labels(service_name=service_name).set(0)
                
                # Try to restart the service
                restart_command = service_config.get("restart_command", "")
                if restart_command:
                    success = await self._restart_service(service_name, restart_command)
                    
                    if success:
                        SERVICE_HEALTH.labels(service_name=service_name).set(1)
                    else:
                        logger.error(f"Failed to restart {service_name} after multiple attempts")
    
    def _check_service_running(self, process_name: str) -> bool:
        """Check if a service is running by process name"""
        if not process_name:
            return False
        
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if service_name in ' '.join(proc.info['cmdline'] or []):
                    return True
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
        return False
    
    async def _restart_service(self, service_name: str, restart_command: str) -> bool:
        """Restart a service using the provided command"""
        logger.info(f"Attempting to restart {service_name}")
        
        try:
            process = await asyncio.create_subprocess_shell(
                restart_command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                logger.info(f"Successfully restarted {service_name}")
                return True
            else:
                logger.error(f"Failed to restart {service_name}: {stderr.decode()}")
                return False
        
        except Exception as e:
            logger.error(f"Error restarting {service_name}: {e}")
            return False
    
    async def _check_stalled_tasks(self):
        """Check for and handle stalled tasks"""
        # Initialize the service manager if needed
        if not self.service_manager:
            self.service_manager = ServiceManager()
        
        # Check for tasks that have been in processing state for too long
        logger.info("Checking for stalled tasks")
        
        # Here we'd normally look for tasks that have been in the "processing" state for longer than
        # a certain threshold, and then move them back to the queue for retry
        # This could involve checking timestamps of task files, etc.
        
        # Example implementation:
        tasks_dir = os.path.join(self.service_manager.data_dir, 'tasks', 'processing')
        if os.path.exists(tasks_dir):
            now = time.time()
            stall_threshold = 3600  # 1 hour
            
            for filename in os.listdir(tasks_dir):
                if not filename.endswith('.json'):
                    continue
                
                task_path = os.path.join(tasks_dir, filename)
                try:
                    file_stat = os.stat(task_path)
                    
                    # If file hasn't been modified in threshold time
                    if now - file_stat.st_mtime > stall_threshold:
                        with open(task_path, 'r') as f:
                            task = json.load(f)
                        
                        logger.info(f"Found stalled task: {task.get('id')}")
                        
                        # Re-queue the task
                        task_type = task.get('type')
                        payload = task.get('payload', {})
                        
                        await self.service_manager.enqueue_task(task_type, payload)
                        
                        # Remove the stalled task
                        os.remove(task_path)
                
                except Exception as e:
                    logger.error(f"Error processing stalled task {filename}: {e}")
    
    async def _cleanup_old_data(self):
        """Clean up old data files"""
        logger.info("Cleaning up old data")
        
        max_age_days = self.config.get("cleanup", {}).get("max_age_days", 7)
        max_age_seconds = max_age_days * 86400
        now = time.time()
        
        # Clean up old task results
        results_dir = os.path.join('data', 'tasks', 'completed')
        if os.path.exists(results_dir):
            for filename in os.listdir(results_dir):
                if not filename.endswith('.json'):
                    continue
                
                file_path = os.path.join(results_dir, filename)
                try:
                    file_stat = os.stat(file_path)
                    
                    # If file is older than max_age
                    if now - file_stat.st_mtime > max_age_seconds:
                        os.remove(file_path)
                        logger.debug(f"Removed old task result: {filename}")
                
                except Exception as e:
                    logger.error(f"Error cleaning up file {filename}: {e}")
        
        # More cleanup procedures can be added here
        # ...

async def main():
    parser = argparse.ArgumentParser(description="ML Service Recovery Tool")
    parser.add_argument("--config", default="config/recovery.json", help="Path to recovery config")
    parser.add_argument("--check-only", action="store_true", help="Only check services, don't attempt recovery")
    args = parser.parse_args()
    
    # Create logs directory if it doesn't exist
    os.makedirs("logs", exist_ok=True)
    
    recovery = RecoveryManager(config_path=args.config)
    await recovery.run()

if __name__ == "__main__":
    asyncio.run(main()) 