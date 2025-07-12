import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import PreviewLanding from './pages/PreviewLanding';
import LogoDemo from './pages/LogoDemo';
import Solutions from './pages/Solutions';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import OAuthCallback from './components/auth/OAuthCallback';
import OAuthTest from './components/auth/OAuthTest';

// Import dashboard pages for each user group
import DataLabelingDashboard from './pages/data-labeling/Dashboard';
import AcademyDashboard from './pages/academy/Dashboard';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PreviewLanding />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/preview-landing" element={<PreviewLanding />} />
        <Route path="/logo-demo" element={<LogoDemo />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/solutions/*" element={<Solutions />} />
        
        {/* OAuth Routes */}
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/auth/test" element={<OAuthTest />} />
        
        {/* Protected Routes - Data Annotators */}
        <Route path="/data-labeling/*" element={<DataLabelingDashboard />} />
        
        {/* Protected Routes - Academy */}
        <Route path="/academy/*" element={<AcademyDashboard />} />
        
        {/* Protected Routes - Enterprise/Customer */}
        <Route path="/customer/*" element={<Dashboard />} />
        
        {/* Coming Soon Pages */}
        <Route path="/blog" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-3xl font-bold">Blog - Coming Soon</h1></div>} />
        <Route path="/docs/*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-3xl font-bold">Documentation - Coming Soon</h1></div>} />
        <Route path="/pricing" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-3xl font-bold">Pricing - Coming Soon</h1></div>} />
        <Route path="/contact" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-3xl font-bold">Contact - Coming Soon</h1></div>} />
      </Routes>
    </Router>
  );
} 