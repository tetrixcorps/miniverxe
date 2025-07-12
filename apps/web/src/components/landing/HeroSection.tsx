import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/useAuth';
import NiceModal from '@ebay/nice-modal-react';
import { AdvancedLottieLogo } from '../LottieLogo';

export default function HeroSection() {
  const { user, userGroup, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = () => {
    NiceModal.show('SignupModal');
  };

  const handleDataLabelingAccess = async () => {
    if (!user) {
      // If not logged in, sign in as data annotator
      try {
        await signIn('data-annotator');
        navigate('/data-labeling/dashboard');
      } catch (error) {
        console.error('Sign in error:', error);
        alert('Failed to sign in. Please try again.');
      }
    } else if (userGroup === 'data-annotator') {
      // If already logged in as data annotator, go to dashboard
      navigate('/data-labeling/dashboard');
    } else {
      // If logged in as different user group, show error
      alert('You are currently logged in as a different user type. Please sign out and sign in as a Data Annotator to access this feature.');
    }
  };

  const handleAcademyAccess = async () => {
    if (!user) {
      // If not logged in, sign in as academy user
      try {
        await signIn('academy');
        navigate('/academy/dashboard');
      } catch (error) {
        console.error('Sign in error:', error);
        alert('Failed to sign in. Please try again.');
      }
    } else if (userGroup === 'academy') {
      // If already logged in as academy user, go to dashboard
      navigate('/academy/dashboard');
    } else {
      // If logged in as different user group, show error
      alert('You are currently logged in as a different user type. Please sign out and sign in as an Academy user to access this feature.');
    }
  };

  const handleCustomerAccess = async () => {
    if (!user) {
      // If not logged in, sign in as enterprise user
      try {
        await signIn('enterprise');
        navigate('/customer/dashboard');
      } catch (error) {
        console.error('Sign in error:', error);
        alert('Failed to sign in. Please try again.');
      }
    } else if (userGroup === 'enterprise') {
      // If already logged in as enterprise user, go to dashboard
      navigate('/customer/dashboard');
    } else {
      // If logged in as different user group, show error
      alert('Only Enterprise customers can access this feature. Please contact support for access.');
    }
  };

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center text-center bg-gradient-to-br from-brand-red via-brand-orange to-brand-yellow text-white py-20 px-4">
      {/* Prominent Lottie Animated Logo */}
      <div className="mb-8">
        <AdvancedLottieLogo size="lg" className="text-white" />
      </div>
      <h1 className="text-4xl md:text-6xl font-heading font-extrabold mb-4 drop-shadow-lg">
        Enterprise AI Workflow Integration & <span className="text-brand-yellow">Data Labeling</span>
      </h1>
      <p className="text-lg md:text-2xl max-w-3xl mx-auto mb-8 font-sans">
        TETRIX empowers enterprises to accelerate AI adoption with secure, scalable workflow integration and expert data annotation services.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button 
          onClick={handleDataLabelingAccess}
          className="font-bold px-6 py-3 text-lg bg-brand-yellow text-brand-red hover:bg-brand-orange hover:text-white focus:ring-brand-yellow shadow-lg min-w-[220px]"
        >
          Access Data Labeling
        </Button>
        <Button 
          onClick={handleAcademyAccess}
          className="font-bold px-6 py-3 text-lg bg-white text-brand-red border border-brand-red hover:bg-brand-orange hover:text-white focus:ring-brand-yellow shadow-lg min-w-[220px]"
        >
          Access Code Academy
        </Button>
      </div>
      {!user && (
        <Button onClick={handleSignUp} className="font-bold px-8 py-3 text-lg bg-brand-red text-white hover:bg-brand-orange focus:ring-brand-yellow shadow-lg" data-testid="signup-hero-btn">
          Sign Up
        </Button>
      )}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button 
          onClick={handleCustomerAccess}
          className="font-bold px-6 py-3 text-lg bg-brand-red text-white hover:bg-brand-orange focus:ring-brand-yellow"
        >
          CUSTOMER
        </Button>
        <a href="#contact-form" className="inline-block">
          <Button variant="outline" className="font-bold px-6 py-3 text-lg bg-white text-brand-red border border-brand-red hover:bg-brand-orange hover:text-white focus:ring-brand-yellow">Talk to an Expert</Button>
        </a>
      </div>
    </section>
  );
} 