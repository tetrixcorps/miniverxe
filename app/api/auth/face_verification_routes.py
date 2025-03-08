from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.dependencies import get_current_user
from app.models.user import User
from app.services.verification.nvidia_face_service import NvidiaFaceService
# Alternatively: from app.services.verification.huggingface_face_service import HuggingFaceFaceService

router = APIRouter(prefix="/auth/face-verification")

@router.post("/register")
async def register_face(
    face_image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    face_service: NvidiaFaceService = Depends()  # Change to HuggingFaceFaceService if using that
):
    """Register a user's face for identity verification"""
    # Read image data
    face_image_data = await face_image.read()
    
    # Register face
    result = await face_service.register_face(
        user_id=current_user.id,
        face_image_data=face_image_data
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result

@router.post("/verify")
async def verify_face(
    face_image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    face_service: NvidiaFaceService = Depends()  # Change to HuggingFaceFaceService if using that
):
    """Verify a user's identity with face biometrics"""
    # Read image data
    face_image_data = await face_image.read()
    
    # Verify face
    result = await face_service.verify_face(
        user_id=current_user.id,
        face_image_data=face_image_data
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result

@router.get("/status")
async def get_verification_status(
    current_user: User = Depends(get_current_user)
):
    """Get the user's face verification status"""
    if not current_user.biometric_data:
        return {
            "registered": False,
            "verified": False,
            "message": "Face not registered"
        }
    
    return {
        "registered": True,
        "verified": current_user.biometric_data.get("verified", False),
        "registration_date": current_user.biometric_data.get("registered_at"),
        "last_verified": current_user.biometric_data.get("last_verified")
    } 