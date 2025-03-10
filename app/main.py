from fastapi import FastAPI
from app.api import websocket
from app.api import ringlight  # Import the new ringlight router
from app.middleware.websocket import setup_websocket_middleware
from app.api.routes import conversation

app = FastAPI(title="ML Service API")

# Setup middleware
setup_websocket_middleware(app)

# Include WebSocket routes
app.include_router(websocket.router)

# Add ringlight router
app.include_router(ringlight.router, prefix="/api")

# Add conversation router
app.include_router(conversation.router, prefix="/api") 