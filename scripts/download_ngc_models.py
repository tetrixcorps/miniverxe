#!/usr/bin/env python3
import os
import subprocess
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure NGC models to download
MODELS_CONFIG = {
    "translation": {
        "org": "nvidia",
        "team": "nemo",
        "name": "nmt_en_de_transformer24x6",
        "version": "1.13.0",
        "destination": "/models/translation"
    },
    "classification": {
        "org": "nvidia",
        "team": "tao",
        "name": "pretrained_classification",
        "version": "resnet50_ptm",
        "destination": "/models/classification"
    },
    "asr": {
        "org": "nvidia",
        "team": "riva",
        "name": "asr_english",
        "version": "conformer_en_us",
        "destination": "/models/asr"
    }
}

def install_ngc_cli():
    """Install NGC CLI if not already installed"""
    try:
        subprocess.run(["ngc", "--version"], check=True, capture_output=True)
        logger.info("NGC CLI already installed")
    except (subprocess.SubprocessError, FileNotFoundError):
        logger.info("Installing NGC CLI...")
        subprocess.run(["pip", "install", "nvidia-ngc-cli"], check=True)
        
def download_model(model_config):
    """Download a model from NGC using NGC CLI"""
    model_path = f"{model_config['org']}/{model_config['team']}/{model_config['name']}:{model_config['version']}"
    destination = model_config['destination']
    
    # Create destination directory
    os.makedirs(destination, exist_ok=True)
    
    logger.info(f"Downloading model {model_path} to {destination}")
    
    # Download the model
    try:
        subprocess.run(
            ["ngc", "registry", "model", "download-version", 
             model_path, 
             "--dest", destination],
            check=True
        )
        logger.info(f"Successfully downloaded {model_path}")
        return True
    except subprocess.SubprocessError as e:
        logger.error(f"Failed to download {model_path}: {e}")
        return False

def main():
    """Download all configured models"""
    # Install NGC CLI
    install_ngc_cli()
    
    # Download each model
    for model_name, model_config in MODELS_CONFIG.items():
        success = download_model(model_config)
        if success:
            logger.info(f"Successfully downloaded {model_name} model")
        else:
            logger.error(f"Failed to download {model_name} model")

if __name__ == "__main__":
    main() 