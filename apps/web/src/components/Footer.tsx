import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white py-8 mt-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <span className="font-bold text-lg">TETRIX</span> &copy; {new Date().getFullYear()} All rights reserved.
        </div>
        <nav className="flex space-x-6 text-sm">
          <a href="/about" className="hover:underline">About</a>
          <a href="/services" className="hover:underline">Services</a>
          <a href="/pricing" className="hover:underline">Pricing</a>
          <a href="/contact" className="hover:underline">Contact</a>
        </nav>
      </div>
    </footer>
  );
} 