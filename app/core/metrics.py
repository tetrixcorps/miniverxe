from prometheus_client import Counter, Histogram, Gauge, Summary

# Task metrics
TASK_METRICS = Counter(
    "task_total", 
    "Number of tasks processed",
    ["task_type", "status"]
)

TASK_DURATION = Histogram(
    "task_duration_seconds",
    "Time taken to process tasks",
    ["task_type"]
)

TASK_QUEUE_DEPTH = Gauge(
    "task_queue_depth",
    "Number of tasks waiting in queue",
    ["queue_type"]
)

# Sync metrics
SYNC_OPERATIONS = Counter(
    "sync_operations_total",
    "Number of synchronization operations",
    ["operation_type", "status"]
)

SYNC_LATENCY = Histogram(
    "sync_latency_seconds",
    "Latency of synchronization operations",
    ["operation_type"]
)

SYNC_PENDING = Gauge(
    "sync_pending_operations",
    "Number of pending synchronization operations",
    ["operation_type"]
)

# Service health metrics
SERVICE_HEALTH = Gauge(
    "service_health",
    "Health status of services (1=healthy, 0=unhealthy)",
    ["service_name"]
)

SERVICE_UPTIME = Gauge(
    "service_uptime_seconds",
    "Uptime of services in seconds",
    ["service_name"]
)

# Resource metrics
MEMORY_USAGE = Gauge(
    "memory_usage_bytes",
    "Memory usage in bytes",
    ["component"]
)

DISK_USAGE = Gauge(
    "disk_usage_bytes",
    "Disk usage in bytes",
    ["path"]
)

CPU_USAGE = Gauge(
    "cpu_usage_percent",
    "CPU usage percentage",
    ["component"]
)

# Model metrics
MODEL_INFERENCE_REQUESTS = Counter(
    "model_inference_requests_total",
    "Number of model inference requests",
    ["model_name", "status"]
)

MODEL_INFERENCE_LATENCY = Histogram(
    "model_inference_latency_seconds",
    "Latency of model inference requests",
    ["model_name"]
)

MODEL_CACHE_HITS = Counter(
    "model_cache_hits_total",
    "Number of model cache hits",
    ["model_name"]
)

MODEL_CACHE_MISSES = Counter(
    "model_cache_misses_total",
    "Number of model cache misses",
    ["model_name"]
)

# Queue metrics
QUEUE_SIZE = Gauge(
    "queue_size",
    "Number of items in queue",
    ["queue"]
) 