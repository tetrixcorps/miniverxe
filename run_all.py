#!/usr/bin/env python3
import os
import sys
import argparse
from pathlib import Path
import subprocess
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("logs/run_all.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("run_all")

def setup_environment():
    """Set up the Python environment"""
    logger.info("Setting up environment...")
    
    # Install base requirements
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install base requirements: {e}")
        raise
    
    # Check for NVIDIA compatibility
    has_nvidia = False
    try:
        import torch
        has_nvidia = torch.cuda.is_available() and torch.cuda.device_count() > 0
        if has_nvidia:
            logger.info("NVIDIA GPU detected. Installing NVIDIA-specific dependencies...")
            try:
                # Create requirements-nvidia.txt if it doesn't exist
                if not os.path.exists("requirements-nvidia.txt"):
                    with open("requirements-nvidia.txt", "w") as f:
                        f.write("nemo_toolkit>=1.0.0\n")
                        f.write("nvidia-riva-client>=1.0.0\n")
                
                subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements-nvidia.txt"])
            except subprocess.CalledProcessError as e:
                logger.warning(f"Failed to install NVIDIA dependencies: {e}")
                logger.warning("Continuing with standard backend")
                has_nvidia = False
    except Exception as e:
        logger.warning(f"Failed to detect NVIDIA GPU: {e}")
        has_nvidia = False
        
    # Install the package in development mode
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-e", "."])
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install package in development mode: {e}")
        raise
    
    # Set up NLTK
    try:
        subprocess.check_call([sys.executable, "scripts/setup_nltk.py"])
    except subprocess.CalledProcessError as e:
        logger.warning(f"Failed to set up NLTK: {e}")
    
    logger.info(f"Environment setup complete. NVIDIA support: {'✓' if has_nvidia else '✗'}")
    return has_nvidia

def run_training(backend="standard", use_synthetic_data=False, config_path="config/training.yaml"):
    """Run the training script"""
    logger.info(f"Starting training with backend: {backend}, synthetic data: {use_synthetic_data}")
    
    # Set environment variables
    os.environ["TOKENIZERS_PARALLELISM"] = "false"
    os.environ["USE_NVIDIA_STACK"] = "true" if backend == "nvidia" else "false"
    
    # Add project root to Python path
    project_root = Path(__file__).parent
    sys.path.append(str(project_root))
    
    # Import and run main with parameters
    from scripts.finetune_translation import main
    main(backend=backend, use_synthetic_data=use_synthetic_data, config_path=config_path)

if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Run the full training pipeline")
    parser.add_argument(
        "--skip-setup", 
        action="store_true",
        help="Skip environment setup"
    )
    parser.add_argument(
        "--backend", 
        choices=["auto", "standard", "nvidia"], 
        default="auto",
        help="Backend to use for training (auto, standard, or nvidia)"
    )
    parser.add_argument(
        "--synthetic-data", 
        action="store_true",
        help="Use synthetic data generation for training"
    )
    parser.add_argument(
        "--config", 
        type=str,
        default="config/training.yaml",
        help="Path to training configuration file"
    )
    args = parser.parse_args()
    
    # Create necessary directories
    os.makedirs("logs", exist_ok=True)
    os.makedirs("models", exist_ok=True)
    os.makedirs("config", exist_ok=True)
    
    try:
        # Setup environment if not skipped
        has_nvidia = True
        if not args.skip_setup:
            has_nvidia = setup_environment()
        
        # Determine backend
        backend = args.backend
        if backend == "auto":
            backend = "nvidia" if has_nvidia else "standard"
            logger.info(f"Auto-detected backend: {backend}")
        
        # Run training
        run_training(backend=backend, use_synthetic_data=args.synthetic_data, config_path=args.config)
    except Exception as e:
        logger.error(f"Error: {str(e)}", exc_info=True)
        sys.exit(1) 