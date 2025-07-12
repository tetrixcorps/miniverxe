import React from 'react';

export default function Solutions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-red via-brand-orange to-brand-yellow bg-clip-text text-transparent">
            AI Integration Solutions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your business with our comprehensive AI integration platform. Connect, automate, and scale with intelligent workflows.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-red to-brand-orange rounded-lg flex items-center justify-center mb-6 mx-auto">
              <span className="text-2xl">🤖</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">AI Workflow Automation</h2>
            <p className="text-gray-600 mb-6">
              Build intelligent workflows that automatically process data, make decisions, and execute actions using AI models and machine learning.
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              <li>• Natural Language Processing</li>
              <li>• Predictive Analytics</li>
              <li>• Computer Vision Integration</li>
              <li>• Custom AI Model Deployment</li>
            </ul>
            <button className="w-full bg-brand-red text-white py-3 rounded-lg font-semibold hover:bg-brand-orange transition-colors">
              Get Started
            </button>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-orange to-brand-yellow rounded-lg flex items-center justify-center mb-6 mx-auto">
              <span className="text-2xl">🔗</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Universal Integrations</h2>
            <p className="text-gray-600 mb-6">
              Connect with 500+ tools and APIs to create seamless data flows between your existing systems and AI-powered workflows.
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              <li>• CRM & Marketing Tools</li>
              <li>• Cloud Services (AWS, Azure, GCP)</li>
              <li>• Business Intelligence Platforms</li>
              <li>• Custom API Development</li>
            </ul>
            <button className="w-full bg-brand-orange text-white py-3 rounded-lg font-semibold hover:bg-brand-red transition-colors">
              Explore Integrations
            </button>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-yellow to-brand-red rounded-lg flex items-center justify-center mb-6 mx-auto">
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">AI Analytics & Insights</h2>
            <p className="text-gray-600 mb-6">
              Transform your data into actionable insights with AI-powered analytics, real-time monitoring, and predictive reporting.
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              <li>• Real-time Data Processing</li>
              <li>• Predictive Analytics</li>
              <li>• Automated Reporting</li>
              <li>• Custom Dashboards</li>
            </ul>
            <button className="w-full bg-brand-yellow text-brand-red py-3 rounded-lg font-semibold hover:bg-brand-orange transition-colors">
              View Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 