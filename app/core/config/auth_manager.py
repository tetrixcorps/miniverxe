from typing import Dict, Any, Optional
from pathlib import Path
import yaml
import os
from dataclasses import dataclass
from app.core.logger import CustomLogger
from app.core.exceptions import ConfigurationError

@dataclass
class NvidiaConfig:
    """Nvidia-specific configuration."""
    ngc_api_key: str
    ngc_org: str
    ngc_team: str
    riva_uri: str
    riva_auth_key: Optional[str] = None
    nemo_model_path: Optional[str] = None

@dataclass
class CloudConfig:
    """Cloud service configuration."""
    gcp_credentials_path: str
    gcp_project_id: str
    aws_access_key: Optional[str] = None
    aws_secret_key: Optional[str] = None
    azure_connection_string: Optional[str] = None

@dataclass
class ModelConfig:
    """Model service configuration."""
    huggingface_token: str
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    model_registry_url: Optional[str] = None

class AuthConfigManager:
    """
    Centralized authentication and API configuration manager.
    """

    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize auth configuration manager.
        
        Args:
            config_path: Optional path to auth config file
        """
        self.logger = CustomLogger("auth_manager")
        self.config_path = config_path or os.getenv('AUTH_CONFIG_PATH')
        self.config: Dict[str, Any] = {}
        
        # Load configurations
        self._load_config()
        self._validate_config()
        
        # Initialize specific configurations
        self.nvidia = self._init_nvidia_config()
        self.cloud = self._init_cloud_config()
        self.model = self._init_model_config()

    def _load_config(self):
        """Load configuration from file and environment."""
        # Load from file if exists
        if self.config_path and Path(self.config_path).exists():
            try:
                with open(self.config_path, 'r') as f:
                    self.config = yaml.safe_load(f)
            except Exception as e:
                raise ConfigurationError(
                    f"Failed to load auth config from {self.config_path}: {str(e)}"
                )

        # Override with environment variables
        self._load_from_env()

    def _load_from_env(self):
        """Load configuration from environment variables."""
        # Nvidia configuration
        self.config['nvidia'] = {
            'ngc_api_key': os.getenv('NGC_API_KEY'),
            'ngc_org': os.getenv('NGC_ORG'),
            'ngc_team': os.getenv('NGC_TEAM'),
            'riva_uri': os.getenv('NVIDIA_RIVA_URI', 'localhost:50051'),
            'riva_auth_key': os.getenv('NVIDIA_RIVA_AUTH_KEY'),
            'nemo_model_path': os.getenv('NEMO_MODEL_PATH')
        }

        # Cloud configuration
        self.config['cloud'] = {
            'gcp_credentials_path': os.getenv('GOOGLE_APPLICATION_CREDENTIALS'),
            'gcp_project_id': os.getenv('GOOGLE_CLOUD_PROJECT'),
            'aws_access_key': os.getenv('AWS_ACCESS_KEY_ID'),
            'aws_secret_key': os.getenv('AWS_SECRET_ACCESS_KEY'),
            'azure_connection_string': os.getenv('AZURE_STORAGE_CONNECTION_STRING')
        }

        # Model configuration
        self.config['model'] = {
            'huggingface_token': os.getenv('HUGGINGFACE_API_TOKEN'),
            'openai_api_key': os.getenv('OPENAI_API_KEY'),
            'anthropic_api_key': os.getenv('ANTHROPIC_API_KEY'),
            'model_registry_url': os.getenv('MODEL_REGISTRY_URL')
        }

    def _validate_config(self):
        """Validate required configuration values."""
        required_configs = {
            'nvidia': ['ngc_api_key', 'ngc_org'],
            'cloud': ['gcp_credentials_path', 'gcp_project_id'],
            'model': ['huggingface_token']
        }

        missing_configs = []
        for section, keys in required_configs.items():
            if section not in self.config:
                missing_configs.append(f"Missing section: {section}")
                continue
            
            for key in keys:
                if not self.config[section].get(key):
                    missing_configs.append(f"Missing {section}.{key}")

        if missing_configs:
            raise ConfigurationError(
                f"Invalid authentication configuration: {', '.join(missing_configs)}"
            )

    def _init_nvidia_config(self) -> NvidiaConfig:
        """Initialize Nvidia configuration."""
        return NvidiaConfig(**self.config['nvidia'])

    def _init_cloud_config(self) -> CloudConfig:
        """Initialize cloud configuration."""
        return CloudConfig(**self.config['cloud'])

    def _init_model_config(self) -> ModelConfig:
        """Initialize model configuration."""
        return ModelConfig(**self.config['model'])

    def get_nvidia_credentials(self) -> Dict[str, str]:
        """Get Nvidia NGC credentials."""
        return {
            'api_key': self.nvidia.ngc_api_key,
            'org': self.nvidia.ngc_org,
            'team': self.nvidia.ngc_team
        }

    def get_riva_config(self) -> Dict[str, str]:
        """Get Riva configuration."""
        return {
            'uri': self.nvidia.riva_uri,
            'auth_key': self.nvidia.riva_auth_key
        }

    def get_cloud_credentials(self) -> Dict[str, str]:
        """Get cloud service credentials."""
        return {
            'gcp': {
                'credentials_path': self.cloud.gcp_credentials_path,
                'project_id': self.cloud.gcp_project_id
            },
            'aws': {
                'access_key': self.cloud.aws_access_key,
                'secret_key': self.cloud.aws_secret_key
            },
            'azure': {
                'connection_string': self.cloud.azure_connection_string
            }
        }

    def get_model_credentials(self) -> Dict[str, str]:
        """Get model service credentials."""
        return {
            'huggingface': self.model.huggingface_token,
            'openai': self.model.openai_api_key,
            'anthropic': self.model.anthropic_api_key
        } 