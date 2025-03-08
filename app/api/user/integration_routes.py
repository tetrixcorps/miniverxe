from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from app.models.user import User
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/user")

@router.get("/integrations")
async def get_integrations(
    current_user: User = Depends(get_current_user),
    user_repository: UserRepository = Depends()
):
    """Get user's connected integrations"""
    return await user_repository.get_user_integrations(current_user.id)

@router.delete("/integrations/{provider}")
async def disconnect_integration(
    provider: str,
    current_user: User = Depends(get_current_user),
    user_repository: UserRepository = Depends()
):
    """Disconnect an integration"""
    if provider not in ["google_drive", "tiktok"]:
        raise HTTPException(status_code=400, detail="Invalid integration provider")
        
    success = await user_repository.remove_integration(current_user.id, provider)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to disconnect integration")
        
    return {"status": "success", "message": f"{provider} disconnected successfully"} 