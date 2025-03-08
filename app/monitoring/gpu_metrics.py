import GPUtil
import torch
import time
from prometheus_client import Gauge, Counter
import psutil
import logging

logger = logging.getLogger(__name__)

# Define Prometheus metrics
GPU_UTILIZATION = Gauge("gpu_utilization_percent", "GPU utilization percentage", ["gpu_id"])
GPU_MEMORY_USED = Gauge("gpu_memory_used_mb", "GPU memory used in MB", ["gpu_id"])
GPU_MEMORY_TOTAL = Gauge("gpu_memory_total_mb", "Total GPU memory in MB", ["gpu_id"])
GPU_TEMPERATURE = Gauge("gpu_temperature_celsius", "GPU temperature in Celsius", ["gpu_id"])
GPU_POWER_USAGE = Gauge("gpu_power_usage_watts", "GPU power usage in watts", ["gpu_id"])

INFERENCE_REQUESTS = Counter("model_inference_requests_total", "Total number of inference requests", ["model_name"])
INFERENCE_LATENCY = Gauge("model_inference_latency_seconds", "Inference latency in seconds", ["model_name"])

class GPUMonitor:
    def __init__(self, interval=15):
        self.interval = interval
        self.running = False
        
    def start(self):
        """Start monitoring GPU metrics"""
        self.running = True
        
        # Start monitoring in a separate thread
        import threading
        self.thread = threading.Thread(target=self._monitor_loop)
        self.thread.daemon = True
        self.thread.start()
        
    def stop(self):
        """Stop monitoring GPU metrics"""
        self.running = False
        
    def _monitor_loop(self):
        """Monitor loop that collects and reports GPU metrics"""
        while self.running:
            try:
                # Get GPU information
                gpus = GPUtil.getGPUs()
                
                for i, gpu in enumerate(gpus):
                    # Update Prometheus metrics
                    GPU_UTILIZATION.labels(gpu_id=i).set(gpu.load * 100)
                    GPU_MEMORY_USED.labels(gpu_id=i).set(gpu.memoryUsed)
                    GPU_MEMORY_TOTAL.labels(gpu_id=i).set(gpu.memoryTotal)
                    GPU_TEMPERATURE.labels(gpu_id=i).set(gpu.temperature)
                    GPU_POWER_USAGE.labels(gpu_id=i).set(gpu.powerUsage)
                    
                # PyTorch CUDA metrics if available
                if torch.cuda.is_available():
                    for i in range(torch.cuda.device_count()):
                        # Additional PyTorch specific metrics could be added here
                        # Example: CUDA memory allocated
                        memory_allocated = torch.cuda.memory_allocated(i) / (1024 * 1024)  # MB
                        memory_reserved = torch.cuda.memory_reserved(i) / (1024 * 1024)    # MB
                        
            except Exception as e:
                logger.error(f"Error in GPU monitoring: {e}")
                
            # Sleep until next collection
            time.sleep(self.interval)
            
def record_inference_metrics(model_name, latency):
    """Record inference metrics for a model"""
    INFERENCE_REQUESTS.labels(model_name=model_name).inc()
    INFERENCE_LATENCY.labels(model_name=model_name).set(latency) 