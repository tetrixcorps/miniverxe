import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';

export function Navbar() {
  const location = useLocation();
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-white shadow">
      <div className="font-bold text-xl text-brand-red">TETRIX</div>
      <div className="flex gap-4 items-center">
        <a href="/dashboard" className="inline-block">
          <Button>Dashboard</Button>
        </a>
      </div>
    </nav>
  );
} 