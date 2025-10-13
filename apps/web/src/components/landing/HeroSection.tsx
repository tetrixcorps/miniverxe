import React from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/useAuth';
import NiceModal from '@ebay/nice-modal-react';

export default function HeroSection() {
  const { user, loading } = useAuth();

  const handleSignUp = () => {
    NiceModal.show('SignupModal');
  };

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center text-center bg-gradient-to-br from-brand-red via-brand-orange to-brand-yellow text-white py-20 px-4">
      <h1 className="text-4xl md:text-6xl font-heading font-extrabold mb-4 drop-shadow-lg">
        Enterprise AI Workflow Integration & <span className="text-brand-yellow">Data Labeling</span>
      </h1>
      <p className="text-lg md:text-2xl max-w-3xl mx-auto mb-8 font-sans">
        TETRIX empowers enterprises to accelerate AI adoption with secure, scalable workflow integration and expert data annotation services.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <a href="/data-labeling/dashboard" className="inline-block">
          <Button className="font-bold px-6 py-3 text-lg bg-brand-yellow text-brand-red hover:bg-brand-orange hover:text-white focus:ring-brand-yellow shadow-lg min-w-[220px]">Access Data Labeling</Button>
        </a>
        <a href="/academy/dashboard" className="inline-block">
          <Button className="font-bold px-6 py-3 text-lg bg-white text-brand-red border border-brand-red hover:bg-brand-orange hover:text-white focus:ring-brand-yellow shadow-lg min-w-[220px]">Access Code Academy</Button>
        </a>
      </div>
      {!user && !loading && (
        <Button onClick={handleSignUp} className="font-bold px-8 py-3 text-lg bg-brand-red text-white hover:bg-brand-orange focus:ring-brand-yellow shadow-lg" data-testid="signup-hero-btn">
          Sign Up
        </Button>
      )}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <a href="/contact" className="inline-block">
          <Button className="font-bold px-6 py-3 text-lg bg-brand-red text-white hover:bg-brand-orange focus:ring-brand-yellow">Request a Demo</Button>
        </a>
        <a href="#contact-form" className="inline-block">
          <Button variant="outline" className="font-bold px-6 py-3 text-lg bg-white text-brand-red border border-brand-red hover:bg-brand-orange hover:text-white focus:ring-brand-yellow">Talk to an Expert</Button>
        </a>
      </div>
    </section>
  );
} 