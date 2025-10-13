import React from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <section className="max-w-2xl text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-800">Welcome to Tetrix</h1>
        <p className="text-lg md:text-xl text-gray-700 mb-6">A modern platform for collaborative labeling, learning, and workflow management.</p>
        <a href="/dashboard" className="inline-block">
          <Button>Get Started</Button>
        </a>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card className="p-6 flex flex-col items-center">
          <span className="text-3xl mb-2">⚡</span>
          <h2 className="font-bold text-lg mb-1">Fast & Intuitive</h2>
          <p className="text-gray-600 text-center">Lightning-fast UI with a focus on productivity and ease of use.</p>
        </Card>
        <Card className="p-6 flex flex-col items-center">
          <span className="text-3xl mb-2">🔒</span>
          <h2 className="font-bold text-lg mb-1">Secure & Flexible</h2>
          <p className="text-gray-600 text-center">Role-based access and modular workflows for any team size.</p>
        </Card>
        <Card className="p-6 flex flex-col items-center">
          <span className="text-3xl mb-2">🌱</span>
          <h2 className="font-bold text-lg mb-1">Grow Together</h2>
          <p className="text-gray-600 text-center">Built for collaboration, learning, and continuous improvement.</p>
        </Card>
      </section>
    </div>
  );
} 