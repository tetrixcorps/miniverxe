import React from 'react';

const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-brand-red" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
    ),
    title: 'AI-Powered Automation',
    description: 'Seamlessly integrate AI into your existing workflows with our no-code platform.',
    bg: 'bg-brand-red/10',
    hover: 'group-hover:bg-brand-red/20',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-brand-orange" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06A1.65 1.65 0 0015 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 008.6 15a1.65 1.65 0 00-1.82-.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0015 8.6a1.65 1.65 0 001.82.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 15z"/></svg>
    ),
    title: 'Universal Integrations',
    description: 'Connect with 500+ tools and APIs to create intelligent, automated workflows.',
    bg: 'bg-brand-orange/10',
    hover: 'group-hover:bg-brand-orange/20',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ),
    title: 'Enterprise Security',
    description: 'Bank-grade security with SOC 2 compliance and end-to-end encryption.',
    bg: 'bg-brand-yellow/10',
    hover: 'group-hover:bg-brand-yellow/20',
  },
];

export default function FeaturesSection() {
  return (
    <section aria-label="Features" className="py-16 bg-white">
      <h2 className="text-center text-3xl font-heading font-bold mb-10 text-brand-dark">Why Choose TETRIX?</h2>
      <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <div key={i} className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition group">
            <div className={`mb-4 flex items-center justify-center w-16 h-16 rounded-full ${f.bg} ${f.hover}`}>
              {f.icon}
            </div>
            <h3 className="text-xl font-heading font-bold mb-2">{f.title}</h3>
            <p className="text-gray-600 font-sans">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
} 