import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import PreviewLanding from './pages/PreviewLanding';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/preview-landing" element={<PreviewLanding />} />
      </Routes>
    </Router>
  );
} 