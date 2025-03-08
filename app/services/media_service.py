import os
import time
import logging
import asyncio
from typing import List, Dict, Any
import holoscan
from holoscan.core import Application, Operator, Fragment
from holoscan.operators import FormatConverterOp, InferenceOp, VideoStreamReplayerOp, VideoStreamRecorderOp
from holoscan.resources import UnboundedAllocator

from app.repositories.tasks_repository import TasksRepository
from app.services.storage_service import StorageService
from app.core.config import settings

logger = logging.getLogger(__name__)

class MediaProcessingService:
    """Service for processing media files using Nvidia Holoscan SDK"""
    
    def __init__(self):
        self.storage_service = StorageService()
        self.tasks_repository = TasksRepository()
    
    async def process_media(self, task_id: str, file_path: str, parameters: Dict[str, Any], tasks: List[str]):
        """
        Process a media file with Holoscan for various tasks
        """
        try:
            # Update task status to processing
            await self.tasks_repository.update_task_status(task_id, "processing", progress=0)
            
            # Initialize Holoscan application
            app = self._create_holoscan_app(file_path, parameters, tasks)
            
            # Set up progress callback
            progress_tracker = ProgressTracker(task_id, self.tasks_repository, len(tasks))
            app.add_progress_callback(progress_tracker.update_progress)
            
            # Run application
            result = await self._run_holoscan_app(app)
            
            # Store results
            result_paths = await self._store_processing_results(task_id, result, file_path)
            
            # Update task with final results
            final_result = {
                **result,
                **result_paths
            }
            
            await self.tasks_repository.update_task_status(
                task_id, "completed", 
                progress=100, 
                result=final_result
            )
            
            return final_result
            
        except Exception as e:
            logger.error(f"Error processing media task {task_id}: {str(e)}")
            await self.tasks_repository.update_task_status(
                task_id, "failed", 
                error=str(e)
            )
            raise
        finally:
            # Clean up temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
    
    def _create_holoscan_app(self, file_path: str, parameters: Dict[str, Any], tasks: List[str]) -> Application:
        """Create and configure a Holoscan application based on requested tasks"""
        app = holoscan.core.Application()
        
        # Configure the resource allocation
        app.config.add("allocator", UnboundedAllocator())
        
        # Add video source operator
        app.add_operator(
            "source", 
            VideoStreamReplayerOp(
                app,
                name="source",
                filename=file_path
            )
        )
        
        # Configure processing pipeline based on requested tasks
        if "transcribe" in tasks:
            self._add_transcription_operators(app, parameters)
            
        if "enhance" in tasks:
            self._add_enhancement_operators(app, parameters)
            
        if "categorize" in tasks:
            self._add_categorization_operators(app, parameters)
        
        # Add output recorder
        output_path = f"/tmp/processed_{os.path.basename(file_path)}"
        app.add_operator(
            "output",
            VideoStreamRecorderOp(
                app,
                name="output",
                filename=output_path
            )
        )
        
        # Connect the operators
        self._connect_operators(app, tasks)
        
        return app
    
    def _add_transcription_operators(self, app: Application, parameters: Dict[str, Any]):
        """Add operators for audio transcription"""
        # Add format converter for audio extraction
        app.add_operator(
            "audio_extractor",
            FormatConverterOp(
                app,
                name="audio_extractor",
                input_format="video",
                output_format="audio"
            )
        )
        
        # Add speech recognition operator
        language_model = "en_us_generic" if parameters.get("language", "en-US") == "en-US" else "multilingual"
        app.add_operator(
            "transcriber",
            InferenceOp(
                app,
                name="transcriber",
                model_path=f"{settings.MODELS_DIR}/riva_speech_{language_model}",
                batch_size=16,
                enable_timestamps=True
            )
        )
    
    def _add_enhancement_operators(self, app: Application, parameters: Dict[str, Any]):
        """Add operators for media enhancement"""
        # Super resolution if requested
        if parameters.get("enhance_resolution", False):
            app.add_operator(
                "super_resolution",
                InferenceOp(
                    app,
                    name="super_resolution",
                    model_path=f"{settings.MODELS_DIR}/nvidia_ssr",
                    batch_size=1
                )
            )
        
        # Audio denoising if requested
        if parameters.get("denoise_audio", False):
            app.add_operator(
                "audio_denoiser",
                InferenceOp(
                    app,
                    name="audio_denoiser",
                    model_path=f"{settings.MODELS_DIR}/nvidia_denoiser",
                    batch_size=4
                )
            )
    
    def _add_categorization_operators(self, app: Application, parameters: Dict[str, Any]):
        """Add operators for content categorization"""
        # Add frame sampler (analyze 1 frame per second)
        app.add_operator(
            "frame_sampler",
            CustomFrameSamplerOp(
                app,
                name="frame_sampler",
                sample_rate=1  # 1 frame per second
            )
        )
        
        # Add classification operator
        app.add_operator(
            "classifier",
            InferenceOp(
                app,
                name="classifier",
                model_path=f"{settings.MODELS_DIR}/nvidia_classification",
                batch_size=16
            )
        )
    
    def _connect_operators(self, app: Application, tasks: List[str]):
        """Connect operators based on the requested processing tasks"""
        # Base video path
        app.add_flow("source", "output")
        
        # Transcription path
        if "transcribe" in tasks:
            app.add_flow("source", "audio_extractor")
            app.add_flow("audio_extractor", "transcriber")
        
        # Enhancement path
        if "enhance" in tasks:
            if "super_resolution" in app.operators:
                app.add_flow("source", "super_resolution")
                app.add_flow("super_resolution", "output")
            
            if "audio_denoiser" in app.operators:
                app.add_flow("audio_extractor", "audio_denoiser")
        
        # Categorization path
        if "categorize" in tasks:
            app.add_flow("source", "frame_sampler")
            app.add_flow("frame_sampler", "classifier")
    
    async def _run_holoscan_app(self, app: Application) -> Dict[str, Any]:
        """Run the Holoscan application and collect results"""
        # Start the application in a separate process to not block the event loop
        process = await asyncio.create_subprocess_exec(
            "python", "-c", 
            f"import holoscan; app = {app.serialize()}; app.run()",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise RuntimeError(f"Holoscan application failed: {stderr.decode()}")
        
        # Parse results from stdout
        result = self._parse_holoscan_results(stdout.decode())
        return result
    
    def _parse_holoscan_results(self, output: str) -> Dict[str, Any]:
        """Parse results from Holoscan application output"""
        # Simplified implementation - in practice would parse structured output
        result = {
            "transcription_complete": "Transcription complete" in output,
            "enhancement_complete": "Enhancement complete" in output,
            "categorization_complete": "Categorization complete" in output,
            "duration": self._extract_duration(output),
            "resolution": self._extract_resolution(output),
            "detected_language": self._extract_language(output),
            "categories": self._extract_categories(output),
            "transcript": self._extract_transcript(output)
        }
        return result
    
    async def _store_processing_results(
        self, task_id: str, result: Dict[str, Any], original_file_path: str
    ) -> Dict[str, str]:
        """Store processing results in permanent storage"""
        result_paths = {}
        
        # Store enhanced media if available
        processed_file_path = f"/tmp/processed_{os.path.basename(original_file_path)}"
        if os.path.exists(processed_file_path):
            enhanced_url = await self.storage_service.upload_file(
                processed_file_path,
                f"media/{task_id}/enhanced_{os.path.basename(original_file_path)}"
            )
            result_paths["enhanced_url"] = enhanced_url
        
        # Store transcript if available
        if result.get("transcript"):
            transcript_path = f"/tmp/{task_id}_transcript.json"
            with open(transcript_path, "w") as f:
                import json
                json.dump({"transcript": result["transcript"]}, f)
            
            transcript_url = await self.storage_service.upload_file(
                transcript_path,
                f"media/{task_id}/transcript.json"
            )
            result_paths["transcript_url"] = transcript_url
            os.remove(transcript_path)
        
        return result_paths
    
    def _extract_duration(self, output: str) -> float:
        """Extract media duration from output"""
        # Implementation would parse duration from output
        import re
        match = re.search(r"Duration: (\d+\.\d+)", output)
        return float(match.group(1)) if match else 0.0
    
    def _extract_resolution(self, output: str) -> str:
        """Extract resolution from output"""
        import re
        match = re.search(r"Resolution: (\d+x\d+)", output)
        return match.group(1) if match else "unknown"
    
    def _extract_language(self, output: str) -> str:
        """Extract detected language from output"""
        import re
        match = re.search(r"Detected language: (\w+)", output)
        return match.group(1) if match else "en"
    
    def _extract_categories(self, output: str) -> List[Dict[str, Any]]:
        """Extract content categories from output"""
        # Implementation would parse categories from output
        import re
        categories = []
        category_matches = re.finditer(r"Category: ([\w\s]+), confidence: (\d+\.\d+)", output)
        
        for match in category_matches:
            categories.append({
                "label": match.group(1),
                "confidence": float(match.group(2))
            })
        
        return categories
    
    def _extract_transcript(self, output: str) -> List[Dict[str, Any]]:
        """Extract transcript from output"""
        # Implementation would parse transcript with timestamps from output
        import re
        transcript = []
        transcript_matches = re.finditer(
            r"Transcript segment: \[([\d\.]+)-([\d\.]+)\] (.*)",
            output
        )
        
        for match in transcript_matches:
            transcript.append({
                "start_time": float(match.group(1)),
                "end_time": float(match.group(2)),
                "text": match.group(3)
            })
        
        return transcript


class ProgressTracker:
    """Helper class to track and update progress of media processing tasks"""
    
    def __init__(self, task_id: str, repository: TasksRepository, total_tasks: int):
        self.task_id = task_id
        self.repository = repository
        self.total_tasks = total_tasks
        self.completed_tasks = 0
        self.last_update_time = 0
    
    async def update_progress(self, stage: str, progress: float):
        """Update task progress in database"""
        current_time = time.time()
        # Limit updates to once per second to avoid database overload
        if current_time - self.last_update_time < 1.0:
            return
            
        if stage == "complete":
            self.completed_tasks += 1
        
        # Calculate overall progress
        overall_progress = min(99, (self.completed_tasks * 100 / self.total_tasks) + 
                              (progress / self.total_tasks))
        
        await self.repository.update_task_status(
            self.task_id,
            "processing",
            progress=overall_progress
        )
        self.last_update_time = current_time


# Custom operators for Holoscan
class CustomFrameSamplerOp(Operator):
    """Custom operator to sample frames at a specific rate"""
    
    def __init__(self, fragment, name, sample_rate=1):
        super().__init__(fragment, name)
        self.sample_rate = sample_rate
        self.frame_count = 0
    
    def setup(self, spec):
        self.register_input("input")
        self.register_output("output")
    
    def compute(self, op_input, op_output, context):
        frame = op_input.receive("input")
        self.frame_count += 1
        
        # Only process every Nth frame
        if self.frame_count % self.sample_rate == 0:
            op_output.emit(frame, "output") 