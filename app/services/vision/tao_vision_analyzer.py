import numpy as np
import cv2
import tritonclient.http as httpclient
from typing import Dict, List, Any

class TAOVisionAnalyzer:
    def __init__(self, triton_url: str = "triton-inference-server:8000"):
        self.triton_client = httpclient.InferenceServerClient(triton_url)
        self.model_name = "tao_classification"
        self.input_name = "input_image"
        self.output_name = "predictions"
        
    async def analyze_image(self, image_data: bytes) -> Dict[str, Any]:
        """Analyze image using TAO pre-trained models via Triton"""
        # Convert image bytes to numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Preprocess image
        resized = cv2.resize(image, (224, 224))
        input_data = np.expand_dims(resized.transpose(2, 0, 1), axis=0).astype(np.float32)
        
        # Create inference inputs
        inputs = [
            httpclient.InferInput(self.input_name, input_data.shape, "FP32")
        ]
        inputs[0].set_data_from_numpy(input_data)
        
        # Run inference
        outputs = [httpclient.InferRequestedOutput(self.output_name)]
        response = self.triton_client.infer(
            self.model_name, 
            inputs, 
            outputs=outputs
        )
        
        # Process results
        result = response.as_numpy(self.output_name)
        predictions = self._process_predictions(result)
        
        return predictions
        
    def _process_predictions(self, result: np.ndarray) -> Dict[str, Any]:
        """Process prediction results into a usable format"""
        # This would depend on the TAO model output format
        # For classification model example:
        indices = np.argsort(result[0])[::-1][:5]  # Top 5 predictions
        
        # Convert to class names (example)
        class_names = ["class1", "class2", "class3", "class4", "class5"]  # Replace with actual classes
        
        predictions = {
            "top_predictions": [
                {"class": class_names[i], "confidence": float(result[0][i])}
                for i in indices
            ],
            "primary_prediction": class_names[indices[0]]
        }
        
        return predictions 