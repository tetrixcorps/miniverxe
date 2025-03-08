import React, { useState, useRef } from 'react';
import { useApi } from '../../services/api';
import { Card, Button, Alert } from '../ui';
import './FaceVerification.css';

const FaceVerificationSetup: React.FC = () => {
  const [step, setStep] = useState<'instructions' | 'capture' | 'processing' | 'complete' | 'error'>('instructions');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  const api = useApi();
  
  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      mediaStreamRef.current = stream;
      setStep('capture');
    } catch (err) {
      setError('Could not access camera: ' + String(err));
      setStep('error');
    }
  };
  
  // Stop camera
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      mediaStreamRef.current = null;
    }
  };
  
  // Capture image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        
        // Stop camera
        stopCamera();
      }
    }
  };
  
  // Try again
  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };
  
  // Submit for verification
  const submitImage = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    
    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('face_image', blob, 'face.jpg');
      
      // Submit to API
      const result = await api.post('/auth/face-verification/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (result.data.success) {
        setStep('complete');
      } else {
        setError(result.data.message || 'Failed to register face');
        setStep('error');
      }
    } catch (err) {
      setError('Error submitting image: ' + String(err));
      setStep('error');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  return (
    <Card className="face-verification-setup">
      <h2>Biometric Verification Setup</h2>
      
      {error && <Alert type="error">{error}</Alert>}
      
      {step === 'instructions' && (
        <div className="instructions-step">
          <p>
            To verify your identity for high-value transactions, we need to set up 
            facial recognition. This helps protect your account and enables secure transactions.
          </p>
          <ul>
            <li>Make sure you're in a well-lit area</li>
            <li>Remove glasses, hats, or anything covering your face</li>
            <li>Look directly at the camera when taking the photo</li>
          </ul>
          <Button onClick={startCamera}>Start Setup</Button>
        </div>
      )}
      
      {step === 'capture' && (
        <div className="capture-step">
          <div className="video-container">
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
            />
            <div className="face-outline"></div>
          </div>
          
          <p>Position your face inside the outline and take a photo</p>
          
          <Button onClick={captureImage}>Capture Photo</Button>
        </div>
      )}
      
      {capturedImage && step === 'capture' && (
        <div className="review-step">
          <div className="captured-image">
            <img src={capturedImage} alt="Captured face" />
          </div>
          
          <div className="action-buttons">
            <Button variant="outline" onClick={retake}>Retake</Button>
            <Button 
              onClick={submitImage}
              isLoading={isProcessing}
              loadingText="Processing..."
            >
              Use This Photo
            </Button>
          </div>
        </div>
      )}
      
      {step === 'processing' && (
        <div className="processing-step">
          <div className="spinner"></div>
          <p>Processing your biometric data...</p>
        </div>
      )}
      
      {step === 'complete' && (
        <div className="complete-step">
          <div className="success-icon">✓</div>
          <h3>Verification Setup Complete!</h3>
          <p>
            Your face has been registered successfully. You can now use facial
            verification for secure transactions on the platform.
          </p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Return to Dashboard
          </Button>
        </div>
      )}
      
      {step === 'error' && (
        <div className="error-step">
          <Button onClick={() => setStep('instructions')}>Try Again</Button>
        </div>
      )}
      
      {/* Hidden canvas for capturing the image */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="privacy-note">
        <p>
          <strong>Privacy Note:</strong> Your biometric data is encrypted and used only for 
          verification purposes. Your actual image is not stored.
        </p>
      </div>
    </Card>
  );
};

export default FaceVerificationSetup; 