// Unified Onboarding Flow Component
// Integrates phone authentication, Stripe trial, and WhatsApp Business Account setup

import React, { useState, useEffect, useRef } from 'react';
import { smart2FAService, TwoFAConfig } from '../services/smart2faService';
import { stripeTrialService, TrialUser, OnboardingData } from '../services/stripeTrialService';
import { whatsappOnboardingService, WABAOnboardingData } from '../services/whatsappOnboardingService';

interface UnifiedOnboardingFlowProps {
  onComplete: (user: TrialUser) => void;
  onError: (error: string) => void;
}

type OnboardingStep = 
  | 'phone_entry'
  | 'phone_verification'
  | 'business_info'
  | 'payment_method'
  | 'waba_onboarding'
  | 'trial_active'
  | 'completed';

const UnifiedOnboardingFlow: React.FC<UnifiedOnboardingFlowProps> = ({
  onComplete,
  onError
}) => {
  // State management
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('phone_entry');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<TrialUser | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    businessName: '',
    displayName: '',
    businessCategory: '',
    businessDescription: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [wabaData, setWabaData] = useState<WABAOnboardingData>({
    businessName: '',
    displayName: '',
    businessCategory: '',
    businessDescription: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    phoneNumber: '',
    email: '',
    businessType: 'BUSINESS',
    verificationMethod: 'SMS'
  });
  const [trialStatus, setTrialStatus] = useState({
    status: 'not_started' as const,
    daysRemaining: 0,
    trialEndDate: new Date()
  });

  // Refs for form elements
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus inputs
  useEffect(() => {
    if (currentStep === 'phone_entry' && phoneInputRef.current) {
      phoneInputRef.current.focus();
    } else if (currentStep === 'phone_verification' && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [currentStep]);

  // Handle phone number submission
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Initiate 2FA with voice (primary) or SMS (fallback)
      const result = await smart2FAService.initiateSmart2FA(phoneNumber, navigator.userAgent);
      
      if (result.success) {
        setVerificationId(result.verificationId);
        setCurrentStep('phone_verification');
        
        // Show method used and estimated delivery time
        console.log(`Verification sent via ${result.method}, estimated delivery: ${result.estimatedDelivery}s`);
      } else {
        setError('Failed to send verification. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Phone verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Verify OTP and trigger onboarding
      const result = await smart2FAService.verifyAndOnboard(verificationId, otpCode, {
        businessName: onboardingData.businessName,
        displayName: onboardingData.displayName,
        businessCategory: onboardingData.businessCategory,
        businessDescription: onboardingData.businessDescription,
        website: onboardingData.website,
        address: onboardingData.address,
        timezone: onboardingData.timezone
      });

      if (result.success) {
        setUser(result.user);
        setCurrentStep('business_info');
        
        // Pre-fill WABA data with verified phone number
        setWabaData(prev => ({
          ...prev,
          phoneNumber: result.user.phoneNumber,
          businessName: result.user.businessName || '',
          displayName: result.user.displayName || ''
        }));
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      console.error('OTP verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle business information submission
  const handleBusinessInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingData.businessName || !onboardingData.displayName) return;

    setIsLoading(true);
    setError('');

    try {
      // Update user with business information
      if (user) {
        const updatedUser = {
          ...user,
          businessName: onboardingData.businessName,
          displayName: onboardingData.displayName
        };
        setUser(updatedUser);
        setWabaData(prev => ({
          ...prev,
          businessName: onboardingData.businessName,
          displayName: onboardingData.displayName,
          businessCategory: onboardingData.businessCategory,
          businessDescription: onboardingData.businessDescription,
          website: onboardingData.website,
          address: onboardingData.address,
          timezone: onboardingData.timezone
        }));
        setCurrentStep('payment_method');
      }
    } catch (err) {
      setError('Failed to save business information. Please try again.');
      console.error('Business info error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle payment method setup
  const handlePaymentMethodSubmit = async (paymentMethodId: string) => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      // Start 7-day free trial with card-on-file
      const trialResult = await stripeTrialService.startFreeTrial(user, onboardingData, paymentMethodId);
      
      if (trialResult.success) {
        const updatedUser = {
          ...user,
          stripeCustomerId: trialResult.customerId,
          trialStatus: 'active' as const,
          trialStartDate: new Date(),
          trialEndDate: trialResult.trialEndDate,
          cardOnFile: true
        };
        setUser(updatedUser);
        setTrialStatus({
          status: 'active',
          daysRemaining: 7,
          trialEndDate: trialResult.trialEndDate
        });
        setCurrentStep('waba_onboarding');
      } else {
        setError(trialResult.error || 'Failed to start trial. Please try again.');
      }
    } catch (err) {
      setError('Payment setup failed. Please try again.');
      console.error('Payment method error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle WABA onboarding
  const handleWABAOnboarding = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      // Initiate WhatsApp Business Account onboarding
      const wabaResult = await whatsappOnboardingService.initiateWABAOnboarding(user.id, wabaData);
      
      if (wabaResult.success) {
        setCurrentStep('trial_active');
        
        // Start polling for WABA status updates
        startWABAStatusPolling(wabaResult.wabaId!);
      } else {
        setError(wabaResult.error || 'Failed to start WhatsApp onboarding. Please try again.');
      }
    } catch (err) {
      setError('WhatsApp onboarding failed. Please try again.');
      console.error('WABA onboarding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for WABA status updates
  const startWABAStatusPolling = (wabaId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await whatsappOnboardingService.getWABAStatus(wabaId);
        
        if (status.status === 'approved') {
          clearInterval(pollInterval);
          setCurrentStep('completed');
          onComplete(user!);
        } else if (status.status === 'rejected') {
          clearInterval(pollInterval);
          setError('WhatsApp Business Account was not approved. Please contact support.');
        }
      } catch (err) {
        console.error('WABA status polling error:', err);
      }
    }, 30000); // Poll every 30 seconds

    // Clear interval after 24 hours
    setTimeout(() => clearInterval(pollInterval), 24 * 60 * 60 * 1000);
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'phone_entry':
        return (
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Get Started with TETRIX</h2>
            <p className="text-gray-600 mb-6 text-center">
              Enter your phone number to begin your 7-day free trial
            </p>
            
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !phoneNumber.trim()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Start Free Trial'}
              </button>
            </form>
          </div>
        );

      case 'phone_verification':
        return (
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Verify Your Phone</h2>
            <p className="text-gray-600 mb-6 text-center">
              We've sent a verification code to {phoneNumber}
            </p>
            
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  ref={otpInputRef}
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              
              <button
                type="button"
                onClick={() => setCurrentStep('phone_entry')}
                className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100"
              >
                Change Phone Number
              </button>
            </form>
          </div>
        );

      case 'business_info':
        return (
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Business Information</h2>
            <p className="text-gray-600 mb-6 text-center">
              Tell us about your business to set up WhatsApp messaging
            </p>
            
            <form onSubmit={handleBusinessInfoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={onboardingData.businessName}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="Your Business Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={onboardingData.displayName}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Name shown to customers"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Category
                </label>
                <select
                  value={onboardingData.businessCategory}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, businessCategory: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="RETAIL">Retail</option>
                  <option value="SERVICES">Services</option>
                  <option value="HEALTHCARE">Healthcare</option>
                  <option value="EDUCATION">Education</option>
                  <option value="TECHNOLOGY">Technology</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  value={onboardingData.businessDescription}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, businessDescription: e.target.value }))}
                  placeholder="Brief description of your business"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !onboardingData.businessName || !onboardingData.displayName}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Continue to Payment'}
              </button>
            </form>
          </div>
        );

      case 'payment_method':
        return (
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Add Payment Method</h2>
            <p className="text-gray-600 mb-6 text-center">
              Add a card to start your 7-day free trial. You won't be charged until the trial ends.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-yellow-600 mr-3">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <strong>Free Trial:</strong> Your card will be charged $99/month after the 7-day trial period.
                </div>
              </div>
            </div>
            
            {/* Stripe Elements would go here */}
            <div className="space-y-4">
              <div className="border border-gray-300 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Card Information</p>
                <div className="h-12 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-500">Stripe Elements will be integrated here</span>
                </div>
              </div>
              
              <button
                onClick={() => handlePaymentMethodSubmit('mock_payment_method_id')}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Start Free Trial'}
              </button>
            </div>
          </div>
        );

      case 'waba_onboarding':
        return (
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Setting Up WhatsApp</h2>
            <p className="text-gray-600 mb-6 text-center">
              We're setting up your WhatsApp Business Account. This usually takes 24-48 hours.
            </p>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-blue-600 mr-3">📱</div>
                  <div className="text-sm text-blue-800">
                    <strong>WhatsApp Business Account:</strong> Being reviewed by Meta
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-green-600 mr-3">✅</div>
                  <div className="text-sm text-green-800">
                    <strong>Free Trial:</strong> Active for {trialStatus.daysRemaining} days
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleWABAOnboarding}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Setting Up...' : 'Continue Setup'}
              </button>
            </div>
          </div>
        );

      case 'trial_active':
        return (
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Welcome to TETRIX!</h2>
            <p className="text-gray-600 mb-6 text-center">
              Your free trial is active. We're setting up your WhatsApp Business Account.
            </p>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-green-600 mr-3">🎉</div>
                  <div className="text-sm text-green-800">
                    <strong>Free Trial Active:</strong> {trialStatus.daysRemaining} days remaining
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-blue-600 mr-3">⏳</div>
                  <div className="text-sm text-blue-800">
                    <strong>WhatsApp Setup:</strong> In progress (24-48 hours)
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => onComplete(user!)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="max-w-md mx-auto text-center">
            <div className="text-green-600 text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-6">Setup Complete!</h2>
            <p className="text-gray-600 mb-6">
              Your WhatsApp Business Account is ready and your free trial is active.
            </p>
            <button
              onClick={() => onComplete(user!)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700"
            >
              Access Your Dashboard
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">❌</div>
              <div className="text-sm text-red-800">{error}</div>
            </div>
          </div>
        )}
        
        {renderCurrentStep()}
        
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {['phone_entry', 'phone_verification', 'business_info', 'payment_method', 'waba_onboarding', 'trial_active', 'completed'].map((step, index) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${
                currentStep === step ? 'bg-blue-600' : 
                ['phone_entry', 'phone_verification', 'business_info', 'payment_method', 'waba_onboarding', 'trial_active', 'completed'].indexOf(currentStep) > index ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnifiedOnboardingFlow;
