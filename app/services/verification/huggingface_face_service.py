import os
import tempfile
import uuid
import numpy as np
from datetime import datetime
from typing import Dict, Any, Optional
from app.repositories.user_repository import UserRepository
from app.config import settings

# Try to import Hugging Face transformers
try:
    import torch
    from transformers import AutoFeatureExtractor, AutoModel
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("Hugging Face transformers not available, using fallback...")

# OpenCV as fallback
import cv2
from PIL import Image

class HuggingFaceFaceService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
        self.verification_threshold = settings.VERIFICATION_THRESHOLD or 0.85
        
        # Initialize models
        if TRANSFORMERS_AVAILABLE:
            # Load face detection/recognition models
            # Using face-recognition-model from Hugging Face
            try:
                self.feature_extractor = AutoFeatureExtractor.from_pretrained("facebook/deit-base-patch16-224")
                self.model = AutoModel.from_pretrained("facebook/deit-base-patch16-224")
                self.device = "cuda" if torch.cuda.is_available() else "cpu"
                self.model.to(self.device)
                print(f"Using Hugging Face transformers on {self.device}")
            except Exception as e:
                print(f"Error loading Hugging Face models: {e}")
                TRANSFORMERS_AVAILABLE = False
        
        if not TRANSFORMERS_AVAILABLE:
            # Fall back to OpenCV
            self.face_detector = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            print("Using OpenCV for face detection")
    
    async def register_face(self, user_id: str, face_image_data: bytes) -> Dict[str, Any]:
        """Register a user's face for verification"""
        # Save image to temp file
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
            temp_file.write(face_image_data)
            image_path = temp_file.name
        
        try:
            # Extract face embedding
            face_embedding = await self._extract_face_embedding(image_path)
            
            if face_embedding is None:
                return {
                    "success": False,
                    "message": "No face detected in the image"
                }
            
            # Save the face embedding to the user record
            verification_id = str(uuid.uuid4())
            biometric_data = {
                "face_embedding": face_embedding.tolist() if isinstance(face_embedding, np.ndarray) else face_embedding,
                "verification_id": verification_id,
                "registered_at": datetime.utcnow().isoformat(),
                "verified": False
            }
            
            # Update user record
            user = await self.user_repository.get_by_id(user_id)
            if not user:
                return {"success": False, "message": "User not found"}
            
            user.biometric_data = biometric_data
            await self.user_repository.update(user)
            
            return {
                "success": True,
                "verification_id": verification_id,
                "message": "Face registered successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error registering face: {str(e)}"
            }
        finally:
            # Clean up temp file
            if os.path.exists(image_path):
                os.remove(image_path)
    
    async def verify_face(self, user_id: str, face_image_data: bytes) -> Dict[str, Any]:
        """Verify a user's face against their registered data"""
        # Get user data
        user = await self.user_repository.get_by_id(user_id)
        if not user or not user.biometric_data or "face_embedding" not in user.biometric_data:
            return {
                "success": False,
                "message": "No registered face data found"
            }
        
        # Save image to temp file
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
            temp_file.write(face_image_data)
            image_path = temp_file.name
        
        try:
            # Extract face embedding
            face_embedding = await self._extract_face_embedding(image_path)
            
            if face_embedding is None:
                return {
                    "success": False,
                    "message": "No face detected in the image"
                }
            
            # Compare with stored embedding
            stored_embedding = np.array(user.biometric_data["face_embedding"])
            similarity = await self._calculate_similarity(face_embedding, stored_embedding)
            
            verification_success = similarity >= self.verification_threshold
            
            # If verification successful, update user record
            if verification_success:
                user.biometric_data["verified"] = True
                user.biometric_data["last_verified"] = datetime.utcnow().isoformat()
                await self.user_repository.update(user)
            
            return {
                "success": verification_success,
                "confidence": float(similarity),
                "verification_id": user.biometric_data.get("verification_id", ""),
                "message": "Verification successful" if verification_success else "Verification failed"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error during verification: {str(e)}"
            }
        finally:
            # Clean up temp file
            if os.path.exists(image_path):
                os.remove(image_path)
    
    async def _extract_face_embedding(self, image_path: str) -> Optional[np.ndarray]:
        """Extract face embedding from image"""
        if TRANSFORMERS_AVAILABLE:
            try:
                return await self._extract_with_transformers(image_path)
            except Exception as e:
                print(f"Error with transformers extraction: {e}")
                # Fall back to OpenCV if transformers fails
                return await self._extract_with_opencv(image_path)
        else:
            return await self._extract_with_opencv(image_path)
    
    async def _extract_with_transformers(self, image_path: str) -> Optional[np.ndarray]:
        """Extract features using Hugging Face transformers"""
        # Load image
        image = Image.open(image_path).convert('RGB')
        
        # Extract features
        inputs = self.feature_extractor(images=image, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        # Use the CLS token output as the face embedding
        embedding = outputs.last_hidden_state[:, 0, :].cpu().numpy()[0]
        return embedding
    
    async def _extract_with_opencv(self, image_path: str) -> Optional[np.ndarray]:
        """Extract face features using OpenCV as fallback"""
        # Load and preprocess image
        image = cv2.imread(image_path)
        if image is None:
            return None
        
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_detector.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        if len(faces) == 0:
            return None
        
        # Use the largest face
        x, y, w, h = faces[0]
        face_roi = gray[y:y+h, x:x+w]
        
        # Resize to standard size for consistency
        face_roi = cv2.resize(face_roi, (100, 100))
        
        # In a real implementation, we would use a pre-trained face embedding model
        # This is a simplified version that returns the flattened normalized pixel values
        face_feature = face_roi.flatten().astype(np.float32)
        face_feature = face_feature / 255.0  # Normalize
        
        return face_feature
    
    async def _calculate_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calculate similarity between two face embeddings"""
        # Cosine similarity
        dot_product = np.dot(embedding1, embedding2)
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        
        if norm1 == 0 or norm2 == 0:
            return 0
        
        similarity = dot_product / (norm1 * norm2)
        return float(similarity) 