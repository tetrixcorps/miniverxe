import { Router, Request, Response } from 'express';
import { enterprise2FAService } from '../services/enterprise2FAService';

const router = Router();

/**
 * POST /api/v2/2fa/initiate
 * Unified 2FA initiation endpoint (wraps enterprise2FAService)
 */
router.post('/initiate', async (req: Request, res: Response) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  console.log(`🚀 [${requestId}] Unified 2FA initiation request`);
  
  try {
    const {
      phoneNumber,
      method = 'sms',
      customCode,
      timeoutSecs = 300,
      userAgent,
      ipAddress,
      sessionId
    } = req.body;

    // Validate required fields
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
        requestId
      });
    }

    // Use enterprise2FAService to initiate verification
    const result = await enterprise2FAService.initiateVerification({
      phoneNumber,
      method,
      customCode,
      timeoutSecs,
      userAgent: userAgent || req.headers['user-agent'],
      ipAddress: ipAddress || req.ip || req.socket.remoteAddress,
      sessionId
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [${requestId}] Unified 2FA initiation completed in ${duration}ms`);

    return res.status(200).json({
      success: true,
      ...result,
      requestId
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestId}] Unified 2FA initiation failed after ${duration}ms:`, error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to initiate 2FA verification',
      requestId
    });
  }
});

/**
 * POST /api/v2/2fa/verify
 * Unified 2FA verification endpoint (wraps enterprise2FAService)
 */
router.post('/verify', async (req: Request, res: Response) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  console.log(`🔍 [${requestId}] Unified 2FA verification request`);
  
  try {
    const {
      verificationId,
      code,
      phoneNumber,
      userAgent,
      ipAddress,
      sessionId
    } = req.body;

    // Validate required fields
    if (!verificationId || !code) {
      return res.status(400).json({
        success: false,
        error: 'Verification ID and code are required',
        requestId
      });
    }

    // Use enterprise2FAService to verify code
    const result = await enterprise2FAService.verifyCode({
      verificationId,
      code,
      phoneNumber,
      userAgent: userAgent || req.headers['user-agent'],
      ipAddress: ipAddress || req.ip || req.socket.remoteAddress,
      sessionId
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [${requestId}] Unified 2FA verification completed in ${duration}ms`);

    return res.status(200).json({
      success: true,
      ...result,
      requestId
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestId}] Unified 2FA verification failed after ${duration}ms:`, error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify 2FA code',
      requestId
    });
  }
});

export default router;


