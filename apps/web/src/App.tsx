import React from 'react';

const App: React.FC = () => (
  <>
    {/* Header */}
    <header className="w-full bg-gradient-to-r from-brand-red via-brand-orange to-brand-yellow text-white shadow relative">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center space-x-3 group">
          {/* Logo SVG */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="TETRIX Logo" role="img" className="block drop-shadow-lg animate-logo-spin">
            <title>TETRIX Logo</title>
            <defs>
              <linearGradient id="tetrix-gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF3B30" />
                <stop offset="0.5" stopColor="#FF9500" />
                <stop offset="1" stopColor="#FFB300" />
              </linearGradient>
            </defs>
            <rect x="8" y="8" width="16" height="16" rx="4" fill="url(#tetrix-gradient)">
              <animate attributeName="y" values="8;12;8" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x="24" y="8" width="32" height="16" rx="4" fill="url(#tetrix-gradient)">
              <animate attributeName="x" values="24;28;24" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x="24" y="24" width="16" height="32" rx="4" fill="url(#tetrix-gradient)">
              <animate attributeName="height" values="32;28;32" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x="40" y="40" width="16" height="16" rx="4" fill="url(#tetrix-gradient)">
              <animate attributeName="y" values="40;44;40" dur="2s" repeatCount="indefinite" />
            </rect>
          </svg>
          {/* Brand Text */}
          <div className="tetrix-brand tetrix-default text-2xl">
            <span className="tetrix-text font-extrabold tracking-tight font-heading">
              {[...'TETRIX'].map((letter, i) => (
                <span className="tetrix-letter" key={i}>{letter}</span>
              ))}
            </span>
          </div>
        </a>
        <nav aria-label="Main navigation">
          <ul className="hidden md:flex space-x-8 text-lg font-medium items-center">
            <li><a href="/" className="hover:underline focus:outline-none focus:ring-2 focus:ring-brand-yellow">Home</a></li>
            <li><a href="/solutions" className="hover:underline focus:outline-none focus:ring-2 focus:ring-brand-yellow">Solutions</a></li>
            <li><a href="/blog" className="hover:underline focus:outline-none focus:ring-2 focus:ring-brand-yellow">Blog</a></li>
            <li><a href="/docs" className="hover:underline focus:outline-none focus:ring-2 focus:ring-brand-yellow">Documentation</a></li>
            <li><a href="/pricing" className="hover:underline focus:outline-none focus:ring-2 focus:ring-brand-yellow">Pricing</a></li>
            <li>
              <a href="#product-demo" className="bg-brand-yellow text-brand-dark px-4 py-2 rounded-lg font-semibold hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-white">
                Watch Demo (90s)
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
    {/* Main Content */}
    <main>
      {/* Hero Section */}
      <section className="min-h-[60vh] flex flex-col items-center justify-center text-center bg-gradient-to-br from-brand-red via-brand-orange to-brand-yellow text-white py-20 px-4">
        <h1 className="text-4xl md:text-6xl font-heading font-extrabold mb-4 drop-shadow-lg">
          AI Integration, <span className="text-brand-yellow">Simplified</span>
        </h1>
        <p className="text-lg md:text-2xl max-w-3xl mx-auto mb-8 font-sans">
          TETRIX helps businesses seamlessly integrate AI into their workflows. Connect 500+ tools, automate processes, and unlock the power of artificial intelligence with our no-code platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/contact" className="inline-block px-6 py-3 rounded font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow bg-brand-red text-white hover:bg-brand-orange">
            Start Free Trial
          </a>
          <a href="#product-demo" className="inline-block px-6 py-3 rounded font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow bg-white text-brand-red border border-brand-red hover:bg-brand-orange hover:text-white">
            Watch Demo (90s)
          </a>
        </div>
      </section>
      {/* Logo Grid */}
      <section aria-label="Our Partners" className="bg-brand-light py-8">
        <h2 className="text-center text-xl font-bold mb-4 text-brand-dark">Trusted by leading companies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-center justify-items-center py-8 max-w-5xl mx-auto">
          {/* Placeholder logos as <img> or <div> */}
          <div className="flex items-center justify-center h-16 w-32"><div className="h-12 w-auto bg-gray-200 rounded text-gray-400 flex items-center justify-center font-semibold text-sm">TikTok</div></div>
          <div className="flex items-center justify-center h-16 w-32"><div className="h-12 w-auto bg-gray-200 rounded text-gray-400 flex items-center justify-center font-semibold text-sm">NVIDIA</div></div>
          <div className="flex items-center justify-center h-16 w-32"><div className="h-12 w-auto bg-gray-200 rounded text-gray-400 flex items-center justify-center font-semibold text-sm">Shopify</div></div>
          <div className="flex items-center justify-center h-16 w-32"><div className="h-12 w-auto bg-gray-200 rounded text-gray-400 flex items-center justify-center font-semibold text-sm">Meta</div></div>
        </div>
      </section>
      {/* Features Section */}
      <section aria-label="Features" className="py-16 bg-white">
        <h2 className="text-center text-3xl font-heading font-bold mb-10 text-brand-dark">Why Choose TETRIX for AI Integration?</h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="mb-4 text-4xl">🤖</div>
            <h3 className="text-xl font-heading font-bold mb-2">AI-Powered Automation</h3>
            <p className="text-gray-600">Seamlessly integrate AI into your existing workflows with our no-code platform.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="mb-4 text-4xl">🔗</div>
            <h3 className="text-xl font-heading font-bold mb-2">Universal Integrations</h3>
            <p className="text-gray-600">Connect with 500+ tools and APIs to create intelligent, automated workflows.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="mb-4 text-4xl">🛡️</div>
            <h3 className="text-xl font-heading font-bold mb-2">Enterprise Security</h3>
            <p className="text-gray-600">Bank-grade security with SOC 2 compliance and end-to-end encryption.</p>
          </div>
        </div>
      </section>
      {/* Blog Carousel Placeholder */}
      <section className="py-16 bg-gradient-to-br from-brand-light to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark mb-4">Featured Insights</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Discover strategies and insights tailored to your journey with TETRIX</p>
          </div>
          {/* Blog cards grid (static for now) */}
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
              <div className="relative h-48 overflow-hidden"><div className="w-full h-full bg-gray-200 flex items-center justify-center">Image</div></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">AI Integration</span>
                  <span className="text-gray-500 text-sm flex items-center">12 min read</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-brand-orange transition-colors">
                  <a href="/blog/ai-business-workflow-integration" className="hover:underline">How to Integrate AI into Your Business Workflow: A Complete Guide</a>
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">Learn the step-by-step process of successfully integrating AI into your existing business processes and workflows.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center text-white font-medium text-sm">DEW</div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Dr. Emily Watson</p>
                      <p className="text-xs text-gray-500">January 14, 2024 <span className="ml-1">• Updated January 19, 2024</span></p>
                    </div>
                  </div>
                  <div className="text-right"><span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">Awareness</span></div>
                </div>
              </div>
            </div>
            {/* ...repeat for other blog cards... */}
          </div>
          <div className="text-center mt-12">
            <a href="/blog" className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-red transition-colors">View All Posts</a>
          </div>
        </div>
      </section>
      {/* Final CTA Section */}
      <section className="py-16 bg-brand-dark text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-heading font-bold mb-6">Ready to Transform Your Business with AI?</h2>
          <p className="text-xl mb-8">Join thousands of companies already using TETRIX to integrate AI into their workflows and automate their operations.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="inline-block px-6 py-3 rounded font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow bg-brand-red text-white hover:bg-brand-orange">Start Free Trial</a>
            <a href="/docs" className="inline-block px-6 py-3 rounded font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow bg-white text-brand-red border border-brand-red hover:bg-brand-orange hover:text-white">View Documentation</a>
          </div>
        </div>
      </section>
    </main>
    {/* Footer */}
    <footer className="w-full bg-brand-dark text-brand-yellow py-6 mt-8">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <div className="text-sm">&copy; 2024 TETRIX. All rights reserved.</div>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="/about" className="hover:underline">About</a>
          <a href="/contact" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  </>
);

export default App; 