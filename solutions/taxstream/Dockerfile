FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY solutions/taxstream/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY solutions/taxstream /app/

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["python", "app.py"] 