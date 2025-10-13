import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import ServicesOverviewSection from '../components/landing/ServicesOverviewSection';
import BlogCarouselSection from '../components/landing/BlogCarouselSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CTASection from '../components/landing/CTASection';
import ContactFormSection from '../components/landing/ContactFormSection';
import Footer from '../components/Footer';
import NiceModal from '@ebay/nice-modal-react';
import SignupModal from '../modals/SignupModal';

NiceModal.register('SignupModal', SignupModal);

export default function PreviewLanding() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ServicesOverviewSection />
      <BlogCarouselSection />
      <TestimonialsSection />
      <CTASection />
      <ContactFormSection />
      <Footer />
    </div>
  );
} 