import asyncio
import torch
from app.services.model_optimizer import ModelOptimizer, OptimizationConfig
from app.services.translation import TranslationService

async def test_optimization():
    # Initialize services
    translation_service = TranslationService()
    optimizer = ModelOptimizer(
        OptimizationConfig(
            pruning_method="magnitude",
            target_sparsity=0.3
        )
    )
    
    # Test optimization
    try:
        original_size = sum(
            p.nelement() * p.element_size()
            for p in translation_service.model.parameters()
        )
        
        optimized_model = await optimizer.optimize_model(
            translation_service.model,
            create_test_dataloader()
        )
        
        optimized_size = sum(
            p.nelement() * p.element_size()
            for p in optimized_model.parameters()
        )
        
        print(f"Original size: {original_size / 1024 / 1024:.2f} MB")
        print(f"Optimized size: {optimized_size / 1024 / 1024:.2f} MB")
        print(f"Reduction: {(1 - optimized_size/original_size) * 100:.1f}%")
        
    except Exception as e:
        print(f"Optimization test failed: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(test_optimization()) 