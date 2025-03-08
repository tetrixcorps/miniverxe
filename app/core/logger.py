import logging
from typing import Optional
import functools
import time

class CustomLogger:
    """
    Centralized logging configuration for the application.
    Provides standardized logging format and performance tracking.
    """
    
    def __init__(self, name: str, level: str = "INFO"):
        """
        Initialize logger with name and level.
        
        Args:
            name: Logger name
            level: Logging level (default: INFO)
        """
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, level))
        
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)

    @staticmethod
    def log_execution_time(logger: Optional[logging.Logger] = None):
        """
        Decorator to log function execution time.
        
        Args:
            logger: Optional logger instance
        """
        def decorator(func):
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                start_time = time.time()
                result = func(*args, **kwargs)
                execution_time = time.time() - start_time
                
                if logger:
                    logger.info(
                        f"{func.__name__} executed in {execution_time:.2f} seconds"
                    )
                return result
            return wrapper
        return decorator

model_logger = CustomLogger("model_operations", "INFO")
api_logger = CustomLogger("api_operations", "INFO")
service_logger = CustomLogger("service_operations", "INFO") 