"""Exceptions for the AI-Enhanced Microservices Platform SDK."""

class AIClientError(Exception):
    """Base exception for all SDK errors."""
    pass


class AuthenticationError(AIClientError):
    """Authentication related errors."""
    pass


class APIError(AIClientError):
    """API related errors."""
    
    def __init__(self, message: str, status_code: int = None):
        self.status_code = status_code
        super().__init__(message) 