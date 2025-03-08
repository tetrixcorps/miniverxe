import tritonclient.http as httpclient
import tritonclient.utils as tritonutils
import numpy as np
from typing import Dict, Any, List, Optional
import json

class TritonModelService:
    def __init__(self, server_url: str = "triton-inference-server:8000"):
        self.server_url = server_url
        self.client = httpclient.InferenceServerClient(server_url)
        
    async def predict(self, model_name: str, inputs: Dict[str, np.ndarray], 
                     output_names: Optional[List[str]] = None) -> Dict[str, np.ndarray]:
        """Send inference request to Triton server"""
        # Create input tensors
        infer_inputs = []
        for input_name, input_data in inputs.items():
            infer_input = httpclient.InferInput(
                input_name, input_data.shape, tritonutils.np_to_triton_dtype(input_data.dtype)
            )
            infer_input.set_data_from_numpy(input_data)
            infer_inputs.append(infer_input)
            
        # Create output placeholders
        infer_outputs = []
        if output_names:
            for output_name in output_names:
                infer_outputs.append(httpclient.InferRequestedOutput(output_name))
                
        # Run inference
        response = self.client.infer(
            model_name=model_name,
            inputs=infer_inputs,
            outputs=infer_outputs
        )
        
        # Process results
        results = {}
        for output_name in (output_names or response.get_output_names()):
            results[output_name] = response.as_numpy(output_name)
            
        return results 