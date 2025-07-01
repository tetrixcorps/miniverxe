import React from 'react';

const services = [
  {
    title: 'AI Workflow Integration',
    description: 'Seamlessly embed AI into your business processes for automation, insights, and efficiency.',
    color: 'text-brand-red',
  },
  {
    title: 'Data Labeling & Annotation',
    description: 'High-quality, human-in-the-loop data annotation for all data types and industries.',
    color: 'text-brand-orange',
  },
  {
    title: 'Consulting & Strategy',
    description: 'Expert guidance to design, implement, and optimize your AI initiatives.',
    color: 'text-brand-yellow',
  },
  {
    title: 'Ongoing Support',
    description: 'Enterprise-grade support and continuous improvement for your AI solutions.',
    color: 'text-brand-dark',
  },
];

export default function ServicesOverviewSection() {
  return (
    <section aria-label="Services Overview" className="py-16 bg-white">
      <h2 className="text-center text-3xl font-heading font-bold mb-10 text-brand-dark">Our Services</h2>
      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {services.map((service, i) => (
          <div key={i} className="flex flex-col items-start p-6 bg-gray-50 rounded-lg shadow hover:shadow-lg transition">
            <h3 className={`text-xl font-heading font-bold mb-2 ${service.color}`}>{service.title}</h3>
            <p className="text-gray-700 font-sans">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
} 