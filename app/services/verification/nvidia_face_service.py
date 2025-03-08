import os
import tempfile
import uuid
import numpy as np
from datetime import datetime
from typing import Dict, Any, Optional
from app.repositories.user_repository import UserRepository
from app.config import settings

# Try to import NVIDIA's DeepStream SDK
try:
    import pyds
    NVIDIA_DEEPSTREAM_AVAILABLE = True
except ImportError:
    NVIDIA_DEEPSTREAM_AVAILABLE = False
    print("NVIDIA DeepStream SDK not available, trying alternative...")

# Try to import NVIDIA Riva for face recognition
try:
    import nvidia.riva.client as riva_client
    NVIDIA_RIVA_AVAILABLE = True
except ImportError:
    NVIDIA_RIVA_AVAILABLE = False
    print("NVIDIA Riva not available, using fallback methods...")

# OpenCV as fallback
import cv2

class NvidiaFaceService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
        self.verification_threshold = settings.VERIFICATION_THRESHOLD or 0.85
        
        # Initialize NVIDIA services if available
        if NVIDIA_DEEPSTREAM_AVAILABLE:
            # Set up DeepStream face detection pipeline
            self.pgie_config = settings.DEEPSTREAM_CONFIG_PATH
            print("Using NVIDIA DeepStream for face detection")
        elif NVIDIA_RIVA_AVAILABLE:
            # Set up Riva client
            self.riva_client = riva_client.RivaClient(settings.RIVA_API_URL)
            print("Using NVIDIA Riva for face recognition")
        else:
            # Fall back to OpenCV
            self.face_detector = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            self.face_recognizer = cv2.face.LBPHFaceRecognizer_create()
            print("Using OpenCV for face recognition")
    
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
        """Extract face embedding from image using available technology"""
        if NVIDIA_DEEPSTREAM_AVAILABLE:
            return await self._extract_with_deepstream(image_path)
        elif NVIDIA_RIVA_AVAILABLE:
            return await self._extract_with_riva(image_path)
        else:
            return await self._extract_with_opencv(image_path)
    
    async def _extract_with_deepstream(self, image_path: str) -> Optional[np.ndarray]:
        """Extract face embedding using NVIDIA DeepStream"""
        # This would be implemented using NVIDIA DeepStream SDK
        # Placeholder for demonstration
        print(f"Extracting face embedding with DeepStream from {image_path}")
        # Return mock embedding
        return np.random.rand(128)
    
    async def _extract_with_riva(self, image_path: str) -> Optional[np.ndarray]:
        """Extract face embedding using NVIDIA Riva"""
        # This would be implemented using NVIDIA Riva client
        # Placeholder for demonstration
        print(f"Extracting face embedding with Riva from {image_path}")
        # Return mock embedding
        return np.random.rand(128)
    
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
        
        # Use the largest face (or first one in simple implementation)
        x, y, w, h = faces[0]
        face_roi = gray[y:y+h, x:x+w]
        
        # Resize to standard size for consistency
        face_roi = cv2.resize(face_roi, (100, 100))
        
        # In a real implementation, we would use a pre-trained face embedding model
        # This is a simplified version that returns the flattened normalized pixel values
        # as a feature vector
        face_feature = face_roi.flatten().astype(np.float32)
        face_feature = face_feature / 255.0  # Normalize
        
        return face_feature
    
    async def _calculate_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calculate similarity between two face embeddings"""
        # Cosine similarity between embeddings
        dot_product = np.dot(embedding1, embedding2)
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        
        if norm1 == 0 or norm2 == 0:
            return 0
        
        similarity = dot_product / (norm1 * norm2)
        return float(similarity) 