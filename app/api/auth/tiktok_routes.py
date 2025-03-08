from fastapi import APIRouter, Depends, HTTPException, Response, Request
from app.services.auth.tiktok_auth import TikTokAuthService
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter()
tiktok_auth_service = TikTokAuthService()

@router.get("/tiktok/url")
async def get_tiktok_oauth_url(state: str = None):
    """Get TikTok OAuth URL"""
    url = await tiktok_auth_service.get_oauth_url(state)
    return {"url": url}

@router.get("/tiktok/callback")
async def tiktok_oauth_callback(code: str, state: str = None):
    """Handle TikTok OAuth callback"""
    try:
        auth_response = await tiktok_auth_service.handle_oauth_callback(code)
        
        # For popup callback, return HTML that sends a message to the opener
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>JoromiGPT - TikTok Authentication</title>
            <script>
                window.onload = function() {{
                    window.opener.postMessage({{
                        type: 'tiktok-auth-success',
                        authResponse: {json.dumps(auth_response)}
                    }}, window.location.origin);
                    window.close();
                }};
            </script>
        </head>
        <body>
            <h1>Authentication Successful</h1>
            <p>You can close this window and return to JoromiGPT.</p>
        </body>
        </html>
        """
        
        return Response(content=html_content, media_type="text/html")
    except Exception as e:
        # Return error in HTML for popup
        error_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>JoromiGPT - TikTok Authentication Error</title>
            <script>
                window.onload = function() {{
                    window.opener.postMessage({{
                        type: 'tiktok-auth-error',
                        error: "{str(e)}"
                    }}, window.location.origin);
                    window.close();
                }};
            </script>
        </head>
        <body>
            <h1>Authentication Failed</h1>
            <p>There was an error: {str(e)}</p>
            <p>You can close this window and try again.</p>
        </body>
        </html>
        """
        return Response(content=error_html, media_type="text/html")

@router.post("/tiktok/refresh")
async def refresh_tiktok_token(current_user: User = Depends(get_current_user)):
    """Refresh TikTok access token"""
    if "tiktok" not in current_user.social_accounts:
        raise HTTPException(status_code=400, detail="No TikTok account connected")
    
    refresh_token = current_user.social_accounts["tiktok"].get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="No refresh token available")
    
    try:
        updated_tokens = await tiktok_auth_service.refresh_token(
            current_user.id, refresh_token
        )
        return {"status": "success", "expires_at": updated_tokens["expires_at"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/tiktok/disconnect")
async def disconnect_tiktok(current_user: User = Depends(get_current_user)):
    """Disconnect TikTok account"""
    if "tiktok" not in current_user.social_accounts:
        raise HTTPException(status_code=400, detail="No TikTok account connected")
    
    try:
        await tiktok_auth_service.disconnect_user(current_user.id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 