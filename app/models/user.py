from typing import Dict, Any, Optional

class User(BaseModel):
    # ... existing fields ...
    
    # Store OAuth states (for verification)
    oauth_states: Dict[str, str] = Field(default_factory=dict)
    
    # Store integration credentials
    integration_credentials: Dict[str, Dict[str, Any]] = Field(default_factory=dict) 