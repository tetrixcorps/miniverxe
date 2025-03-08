#!/usr/bin/env python3

import asyncio
import os
import sys
import signal
import json
import time
import logging
from datetime import datetime

# Add app directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.core.logger import get_logger
from app.api.routes.background import BackgroundTaskManager
from app.services.asr.riva_asr_service import RivaTranscriptionService
from app.services.vision.vision_service import VisionService
from app.utils.offline_manager import OfflineManager

# Configure logger
logger = get_logger("worker")

# Services
transcription_service = None
vision_service = None
offline_manager = None
background_manager = None

# Initialization
async def initialize_services():
    """Initialize all services needed by the worker."""
    global transcription_service, vision_service, offline_manager, background_manager
    
    logger.info("Initializing worker services...")
    
    # Initialize background task manager
    background_manager = BackgroundTaskManager()
    
    # Initialize services
    transcription_service = RivaTranscriptionService()
    await transcription_service.initialize()
    
    vision_service = VisionService()
    await vision_service.initialize()
    
    offline_manager = OfflineManager()
    
    logger.info("Worker services initialized successfully")

# Task processing
async def process_pending_tasks():
    """Process all pending tasks."""
    try:
        # Get tasks with 'created' status
        created_tasks = await background_manager.get_tasks_by_status("created")
        
        if created_tasks:
            logger.info(f"Found {len(created_tasks)} tasks to process")
            
            for task in created_tasks:
                task_id = task["id"]
                task_type = task["type"]
                
                logger.info(f"Processing task {task_id} of type {task_type}")
                
                try:
                    # Route task to appropriate handler based on type
                    if task_type.startswith("transcription"):
                        await process_transcription_task(task)
                    elif task_type.startswith("vision"):
                        await process_vision_task(task)
                    elif task_type.startswith("integration"):
                        await process_integration_task(task)
                    else:
                        logger.warning(f"Unknown task type: {task_type}")
                        await background_manager.update_task_status(
                            task_id, 
                            "failed", 
                            error=f"Unknown task type: {task_type}"
                        )
                except Exception as e:
                    logger.error(f"Error processing task {task_id}: {str(e)}")
                    await background_manager.update_task_status(
                        task_id, 
                        "failed", 
                        error=str(e)
                    )
        
        # Process offline queue if we're online
        await process_offline_queue()
        
        # Clean up old tasks
        await background_manager.clean_old_tasks(24)  # 24 hours
        
    except Exception as e:
        logger.error(f"Error in process_pending_tasks: {str(e)}")

async def process_transcription_task(task):
    """Process a transcription task."""
    task_id = task["id"]
    files = task["files"]
    
    await background_manager.update_task_status(task_id, "processing", 0)
    
    # Process each file
    for filename, file_info in files.items():
        if file_info["status"] != "pending":
            continue
            
        try:
            # Read file content
            with open(file_info["path"], "rb") as f:
                content = f.read()
                
            # Get options from metadata
            options = task.get("metadata", {}).get("options", {})
            
            # Process with transcription service
            result = await transcription_service.transcribe_file(content, options)
            
            # Save result
            result_file = os.path.join(background_manager.task_output_dir, task_id, f"{filename}_result.json")
            with open(result_file, "w") as f:
                json.dump(result, f, indent=2, default=str)
                
            # Update file status
            await background_manager.update_task_status(
                task_id,
                "processing",
                None,
                {
                    "filename": filename,
                    "status": "success",
                    "transcript": result.get("transcription", "")[:100] + "..."  # Truncated preview
                }
            )
        except Exception as e:
            logger.error(f"Error processing transcription for {filename}: {str(e)}")
            await background_manager.update_task_status(
                task_id,
                "processing",
                None,
                {
                    "filename": filename,
                    "status": "error",
                    "error": str(e)
                }
            )
    
    # Complete the task
    await background_manager.update_task_status(task_id, "completed", 100)

async def process_vision_task(task):
    """Process a vision task."""
    task_id = task["id"]
    files = task["files"]
    
    await background_manager.update_task_status(task_id, "processing", 0)
    
    # Process each file
    total_files = len(files)
    processed = 0
    
    for filename, file_info in files.items():
        if file_info["status"] != "pending":
            continue
            
        try:
            # Read file content
            with open(file_info["path"], "rb") as f:
                content = f.read()
                
            # Get options from metadata
            options = task.get("metadata", {}).get("options", {})
            
            # Process with vision service
            result = await vision_service.process_image(content, options)
            
            # Save result
            result_file = os.path.join(background_manager.task_output_dir, task_id, f"{filename}_result.json")
            
            # If there's an enhanced image, save it separately
            if "image" in result:
                image_file = os.path.join(background_manager.task_output_dir, task_id, f"{filename}_enhanced.jpg")
                with open(image_file, "wb") as f:
                    f.write(result["image"])
                result["enhanced_image_path"] = image_file
                del result["image"]  # Remove binary data from JSON
                
            # Save result JSON
            with open(result_file, "w") as f:
                json.dump(result, f, indent=2, default=str)
                
            # Update file status
            await background_manager.update_task_status(
                task_id,
                "processing",
                None,
                {
                    "filename": filename,
                    "status": "success",
                    "summary": {
                        "persons_detected": len(result.get("detections", [])),
                        "enhanced": result.get("enhanced", False)
                    }
                }
            )
        except Exception as e:
            logger.error(f"Error processing vision for {filename}: {str(e)}")
            await background_manager.update_task_status(
                task_id,
                "processing",
                None,
                {
                    "filename": filename,
                    "status": "error",
                    "error": str(e)
                }
            )
            
        # Update progress
        processed += 1
        progress = int(100 * processed / total_files)
        await background_manager.update_task_status(task_id, "processing", progress)
    
    # Complete the task
    await background_manager.update_task_status(task_id, "completed", 100)

async def process_integration_task(task):
    """Process an integration task."""
    task_id = task["id"]
    metadata = task.get("metadata", {})
    service = metadata.get("service")
    action = metadata.get("action")
    
    await background_manager.update_task_status(task_id, "processing", 0)
    
    # This is a stub implementation - in a real system, you would
    # process this through the appropriate integration handler
    logger.info(f"Processing integration task for {service}/{action}")
    
    # Simulate processing time
    await asyncio.sleep(2)
    
    # Update progress
    await background_manager.update_task_status(task_id, "processing", 50)
    
    # Simulate more processing
    await asyncio.sleep(2)
    
    # Complete the task with a sample result
    await background_manager.update_task_status(
        task_id, 
        "completed", 
        100,
        {
            "service": service,
            "action": action,
            "result": "Integration task processed successfully",
            "timestamp": datetime.now().isoformat()
        }
    )

async def process_offline_queue():
    """Process any pending tasks in the offline queue."""
    if not offline_manager.offline_config.get("enabled"):
        return
        
    # Get queue directory
    queue_dir = offline_manager.queue_dir
    if not os.path.exists(queue_dir):
        return
        
    # Get all JSON files in the queue directory
    queue_files = [f for f in os.listdir(queue_dir) if f.endswith('.json')]
    
    for filename in queue_files:
        try:
            file_path = os.path.join(queue_dir, filename)
            
            # Read the task
            with open(file_path, 'r') as f:
                task = json.load(f)
                
            # Process the task based on its type
            task_id = task.get("id")
            task_type = task.get("type")
            data = task.get("data", {})
            
            logger.info(f"Processing offline task {task_id} of type {task_type}")
            
            # TODO: Implement task processing based on type
            # For now, just log that we would process it
            logger.info(f"Would process offline task: {task}")
            
            # Delete the task file once processed
            os.remove(file_path)
            
        except Exception as e:
            logger.error(f"Error processing offline task {filename}: {str(e)}")

# Main worker loop
async def worker_loop():
    """Main worker loop."""
    try:
        while True:
            await process_pending_tasks()
            await asyncio.sleep(5)  # Sleep between processing cycles
    except asyncio.CancelledError:
        logger.info("Worker loop cancelled")
    except Exception as e:
        logger.error(f"Error in worker loop: {str(e)}")
        raise

# Shutdown handler
async def shutdown(signal, loop):
    """Graceful shutdown."""
    logger.info(f"Received shutdown signal: {signal.name}")
    tasks = [t for t in asyncio.all_tasks() if t is not asyncio.current_task()]
    
    logger.info(f"Cancelling {len(tasks)} outstanding tasks")
    for task in tasks:
        task.cancel()
        
    await asyncio.gather(*tasks, return_exceptions=True)
    loop.stop()
    logger.info("Worker shutdown complete")

# Main function
def main():
    """Main entry point."""
    loop = asyncio.get_event_loop()
    
    # Register shutdown handlers
    for s in (signal.SIGHUP, signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(
            s, lambda s=s: asyncio.create_task(shutdown(s, loop))
        )
    
    try:
        # Initialize services
        loop.run_until_complete(initialize_services())
        
        # Start the worker loop
        logger.info("Starting worker loop")
        loop.create_task(worker_loop())
        loop.run_forever()
    finally:
        loop.close()
        logger.info("Worker process terminated")

if __name__ == "__main__":
    main() 