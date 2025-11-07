import { Router, Request, Response } from 'express';
import { enterprise2FAService } from '../services/enterprise2FAService';

const router = Router();

/**
 * POST /api/enterprise-2fa/initiate
 * Initiates 2FA verification via SMS, Voice, WhatsApp, or Flash Call
 */
router.post('/initiate', async (req: Request, res: Response) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  console.log(`🚀 [${requestId}] Backend 2FA initiation request`);
  
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

    // Normalize phone number to E.164 format
    let phoneStr = String(phoneNumber).trim();
    let cleanPhone = phoneStr.replace(/[^\d+]/g, '');
    
    if (cleanPhone.startsWith('++')) {
      cleanPhone = cleanPhone.substring(1);
    }
    
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    }
    
    const digits = cleanPhone.slice(1).replace(/\D/g, '');
    
    // Validate E.164 format
    if (digits.length < 7 || digits.length > 15 || digits.startsWith('0')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Please enter a valid international number with country code.',
        requestId,
        cleanPhone
      });
    }
    
    const e164 = cleanPhone;

    // Validate method
    const validMethods = ['sms', 'voice', 'flashcall', 'whatsapp'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        error: `Invalid method. Must be one of: ${validMethods.join(', ')}`,
        requestId,
        method
      });
    }

    // Get client IP if not provided
    const clientIP = ipAddress || 
                    req.headers['x-forwarded-for']?.toString().split(',')[0] || 
                    req.headers['x-real-ip']?.toString() || 
                    req.ip || 
                    'unknown';

    // Get user agent if not provided
    const clientUA = userAgent || req.headers['user-agent'] || 'unknown';

    console.log(`🚀 [${requestId}] Calling enterprise2FAService.initiateVerification`);

    // Initiate verification
    const verification = await enterprise2FAService.initiateVerification({
      phoneNumber: e164,
      method,
      customCode,
      timeoutSecs,
      userAgent: clientUA,
      ipAddress: clientIP,
      sessionId
    });

    console.log(`✅ [${requestId}] Verification initiated successfully:`, {
      verificationId: verification.verificationId,
      phoneNumber: verification.phoneNumber,
      method: verification.method,
      status: verification.status
    });

    const responseTime = Date.now() - startTime;
    console.log(`⏱️ [${requestId}] Total request time: ${responseTime}ms`);

    return res.status(200).json({
      success: true,
      verificationId: verification.verificationId,
      message: `Verification ${method.toUpperCase()} sent successfully`,
      estimatedDelivery: method === 'sms' ? '30-60 seconds' : '10-30 seconds',
      requestId,
      responseTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Enterprise 2FA initiation failed after ${responseTime}ms:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
      requestId,
      responseTime
    });
    
    return res.status(500).json({
      success: false,
      error: 'Authentication service is temporarily unavailable. Please try again later.',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'verification_initiation_failed',
        requestId,
        responseTime,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * POST /api/enterprise-2fa/verify
 * Verifies 2FA code
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const {
      verificationId,
      code,
      phoneNumber
    } = req.body;

    // Validate required fields
    if (!verificationId || !code || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Verification ID, code, and phone number are required'
      });
    }

    // Normalize phone number
    let phoneStr = String(phoneNumber).trim();
    let cleanPhone = phoneStr.replace(/[^\d+]/g, '');
    
    if (cleanPhone.startsWith('++')) {
      cleanPhone = cleanPhone.substring(1);
    }
    
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    }
    
    const e164 = cleanPhone;

    console.log(`🔐 Verifying code for verification ID: ${verificationId}`);

    // Verify code
    const result = await enterprise2FAService.verifyCode(verificationId, code, e164);

    if (result.success && result.verified) {
      return res.status(200).json({
        success: true,
        verified: true,
        verificationId: result.verificationId,
        phoneNumber: result.phoneNumber,
        message: 'Verification successful',
        timestamp: result.timestamp
      });
    } else {
      return res.status(400).json({
        success: false,
        verified: false,
        error: result.responseCode === 'rejected' 
          ? 'Invalid verification code. Please check the code and try again.'
          : result.responseCode === 'expired'
          ? 'Verification code has expired. Please request a new code.'
          : result.responseCode === 'max_attempts'
          ? 'Maximum verification attempts exceeded. Please request a new code.'
          : 'Verification failed. Please try again.',
        details: {
          responseCode: result.responseCode,
          verificationId: result.verificationId,
          phoneNumber: result.phoneNumber
        }
      });
    }

  } catch (error) {
    console.error('❌ Enterprise 2FA verification failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Verification service is temporarily unavailable. Please try again later.',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/enterprise-2fa/status
 * Gets verification status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const { verificationId, phoneNumber } = req.query;

    if (!verificationId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Verification ID and phone number are required'
      });
    }

    // This would typically query a database or cache
    // For now, return a basic response
    return res.status(200).json({
      success: true,
      data: {
        verificationId: verificationId as string,
        phoneNumber: phoneNumber as string,
        status: 'pending',
        message: 'Status check not fully implemented - use verify endpoint'
      }
    });

  } catch (error) {
    console.error('❌ Enterprise 2FA status check failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Status check service is temporarily unavailable.',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
});

export default router;

