#!/usr/bin/env python3
import os
import sys
import argparse
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

from scripts.finetune_translation import main

if __name__ == "__main__":
    # Set up environment variables if needed
    os.environ["TOKENIZERS_PARALLELISM"] = "false"
    
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Run training with specified backend")
    parser.add_argument(
        "--backend", 
        choices=["standard", "nvidia"], 
        default="nvidia" if os.environ.get("USE_NVIDIA_STACK", "").lower() == "true" else "standard",
        help="Backend to use for training (standard or nvidia)"
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
    
    # Run training with specified parameters
    main(backend=args.backend, use_synthetic_data=args.synthetic_data, config_path=args.config) 