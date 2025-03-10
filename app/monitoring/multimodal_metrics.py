from prometheus_client import Counter, Histogram, Gauge

# Input processing metrics
INPUT_PROCESSING_TIME = Histogram(
    "input_processing_seconds",
    "Time spent processing different input types",
    ["input_type", "processing_stage"]
)

MODALITY_DISTRIBUTION = Counter(
    "input_modality_total",
    "Distribution of input modalities",
    ["modality_type"]
)

# Model performance metrics
MODEL_PERFORMANCE = Histogram(
    "model_performance_metrics",
    "Various model performance metrics",
    ["model_name", "metric_type"]
)

# Resource utilization
RESOURCE_UTILIZATION = Gauge(
    "resource_utilization_percent",
    "Resource utilization by type",
    ["resource_type", "model_name"]
)

# Conversation metrics
CONVERSATION_METRICS = Histogram(
    "conversation_processing_seconds",
    "Time spent processing conversation interactions",
    ["model", "success"]
)

CONVERSATION_REQUESTS = Counter(
    "conversation_requests_total",
    "Total conversation requests",
    ["model", "language", "streaming"]
)

CONVERSATION_TOKENS = Counter(
    "conversation_tokens_total",
    "Total tokens processed in conversations",
    ["model", "direction"]  # Input or output
) 