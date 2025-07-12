import React, { useState } from 'react';
import { Button } from '../ui/button';
import apiService from '../../lib/api';

export default function ContactFormSection() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      const result = await apiService.submitContactForm(form);
      if (result.error) {
        throw new Error(result.error);
      }
      setStatus('success');
      setForm({ name: '', email: '', company: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <section id="contact-form" className="py-16 bg-white">
      <form className="max-w-lg mx-auto bg-white rounded-lg shadow p-8 flex flex-col gap-6" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-heading font-bold mb-2 text-brand-dark text-center">Request a Demo / Contact Us</h2>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input id="name" name="name" type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring focus:ring-brand-yellow focus:ring-opacity-50" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input id="email" name="email" type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring focus:ring-brand-yellow focus:ring-opacity-50" value={form.email} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
          <input id="company" name="company" type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring focus:ring-brand-yellow focus:ring-opacity-50" value={form.company} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
          <textarea id="message" name="message" rows={4} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring focus:ring-brand-yellow focus:ring-opacity-50" value={form.message} onChange={handleChange}></textarea>
        </div>
        <Button type="submit" className="w-full py-3 px-6 text-lg" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending...' : 'Send Request'}
        </Button>
        {status === 'success' && <div className="text-green-600 text-center">Message sent successfully!</div>}
        {status === 'error' && <div className="text-red-600 text-center">{error}</div>}
      </form>
    </section>
  );
} 