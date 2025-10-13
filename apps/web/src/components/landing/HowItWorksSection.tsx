import React from 'react';

const steps = [
  {
    icon: (
      <svg className="w-8 h-8 text-brand-red" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4-4.03 7-9 7a9.77 9.77 0 01-4-.8L3 20l1.1-3.3A7.98 7.98 0 013 12c0-4 4.03-7 9-7s9 3 9 7z"/></svg>
    ),
    title: 'Consultation',
    description: 'Understand your business needs and define success.',
    bg: 'bg-brand-red/10',
    hover: 'group-hover:bg-brand-red/20',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-brand-orange" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5V3m-8 6v6a4 4 0 004 4h4"/></svg>
    ),
    title: 'Integration',
    description: 'Seamless AI integration into your existing workflows.',
    bg: 'bg-brand-orange/10',
    hover: 'group-hover:bg-brand-orange/20',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.06 2.06 0 112.915 2.914L7.5 18.678l-4 1 1-4 13.362-13.19z"/></svg>
    ),
    title: 'Annotation',
    description: 'Expert data labeling and quality assurance.',
    bg: 'bg-brand-yellow/10',
    hover: 'group-hover:bg-brand-yellow/20',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-brand-dark" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636A9 9 0 105.636 18.364 9 9 0 0018.364 5.636zM9 10h.01M15 10h.01M12 14h.01"/></svg>
    ),
    title: 'Ongoing Support',
    description: 'Continuous improvement and enterprise-grade support.',
    bg: 'bg-brand-dark/10',
    hover: 'group-hover:bg-brand-dark/20',
  },
];

export default function HowItWorksSection() {
  return (
    <section aria-label="How It Works" className="py-16 bg-gray-50">
      <h2 className="text-center text-3xl font-heading font-bold mb-10 text-brand-dark">How It Works</h2>
      <div className="grid gap-8 md:grid-cols-4 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition group">
            <div className={`mb-4 flex items-center justify-center w-16 h-16 rounded-full ${step.bg} ${step.hover}`}>
              {step.icon}
            </div>
            <h3 className="text-lg font-heading font-bold mb-2">{step.title}</h3>
            <p className="text-gray-600 font-sans">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
} 