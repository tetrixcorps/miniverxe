import React from 'react';
import { Button } from '../ui/button';

export default function CTASection() {
  return (
    <section className="py-16 bg-brand-dark text-white">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h2 className="text-3xl font-heading font-bold mb-6">
          Ready to Transform Your Business with AI?
        </h2>
        <p className="text-xl mb-8">
          Join leading companies using TETRIX to integrate AI into their workflows and automate their operations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/contact" className="inline-block">
            <Button>Start Free Trial</Button>
          </a>
          <a href="/docs" className="inline-block">
            <Button variant="outline">View Documentation</Button>
          </a>
        </div>
      </div>
    </section>
  );
} 