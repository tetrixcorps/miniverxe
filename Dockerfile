# Use NVIDIA base image with CUDA support
FROM nvidia/cuda:11.8.0-runtime-ubuntu22.04

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.9 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Install NVIDIA Cosmos specific requirements
RUN pip3 install --no-cache-dir \
    transformers \
    torch \
    nvidia-pyindex \
    nvidia-cuda-runtime-cu11

# Copy application code
COPY . .

# Create model cache directory
RUN mkdir -p /models/tokenizers

# Set environment variables
ENV PYTHONPATH=/app
ENV TOKENIZER_CACHE_DIR=/models/tokenizers

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM python:3.10-slim as test
COPY requirements-dev.txt .
RUN pip install -r requirements-dev.txt
COPY . .
RUN pytest tests/unit tests/integration

FROM python:3.10-slim as production
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app/ /app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 