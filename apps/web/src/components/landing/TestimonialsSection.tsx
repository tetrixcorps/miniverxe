import React from 'react';

const testimonials = [
  {
    quote: 'TETRIX helped us automate 80% of our manual processes with AI, saving us 20 hours per week.',
    author: 'Sarah Chen',
    role: 'CTO, TechFlow Solutions',
  },
  {
    quote: 'The AI integration was seamless. We went from concept to production in just 2 weeks.',
    author: 'Marcus Rodriguez',
    role: 'Head of Operations, DataCorp',
  },
];

export default function TestimonialsSection() {
  return (
    <section aria-label="Testimonials" className="py-20 bg-gradient-to-br from-brand-light to-white">
      <h2 className="text-center text-3xl font-heading font-bold mb-12 text-brand-dark">What Our Clients Say</h2>
      <div className="grid gap-12 md:grid-cols-2 max-w-4xl mx-auto">
        {testimonials.map((t, i) => (
          <div key={i} className="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-10 flex flex-col items-center text-center">
            <svg className="w-12 h-12 text-brand-orange mb-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a4 4 0 01-4-4V7a4 4 0 014-4h6a4 4 0 014 4v6a4 4 0 01-4 4H9zm0 0v2a2 2 0 002 2h2a2 2 0 002-2v-2"/></svg>
            <blockquote className="italic text-xl text-gray-800 mb-6 font-serif">{t.quote}</blockquote>
            <div className="text-sm text-gray-500 font-medium">{t.author}, {t.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
} 