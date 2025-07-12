import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

interface MobileNavigationItem {
  label: string;
  href?: string;
  items?: {
    label: string;
    description: string;
    href: string;
    icon?: string;
  }[];
}

const mobileNavigationItems: MobileNavigationItem[] = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Solutions',
    items: [
      {
        label: 'AI Workflow Automation',
        description: 'Build intelligent workflows with AI models and machine learning',
        href: '/solutions/automation',
        icon: '🤖'
      },
      {
        label: 'Universal Integrations',
        description: 'Connect with 500+ tools and APIs for seamless data flows',
        href: '/solutions/integrations',
        icon: '🔗'
      },
      {
        label: 'AI Analytics & Insights',
        description: 'Transform data into actionable insights with AI-powered analytics',
        href: '/solutions/analytics',
        icon: '📊'
      }
    ]
  },
  {
    label: 'Blog',
    items: [
      {
        label: 'Featured Posts',
        description: 'Latest insights and strategies for AI integration',
        href: '/blog',
        icon: '📝'
      },
      {
        label: 'Case Studies',
        description: 'Real-world examples of AI transformation',
        href: '/blog/case-studies',
        icon: '📈'
      },
      {
        label: 'Tutorials',
        description: 'Step-by-step guides for implementation',
        href: '/blog/tutorials',
        icon: '🎓'
      }
    ]
  },
  {
    label: 'Documentation',
    items: [
      {
        label: 'Getting Started',
        description: 'Quick start guide and overview',
        href: '/docs/getting-started',
        icon: '🚀'
      },
      {
        label: 'API Reference',
        description: 'Complete API documentation and examples',
        href: '/docs/api',
        icon: '🔧'
      },
      {
        label: 'Guides',
        description: 'In-depth tutorials and best practices',
        href: '/docs/guides',
        icon: '📚'
      }
    ]
  },
  {
    label: 'Pricing',
    href: '/pricing'
  },
  {
    label: 'Contact',
    href: '/contact'
  }
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setExpandedItems([]);
    }
  };

  const toggleItem = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md text-gray-700 hover:text-brand-red hover:bg-gray-100 transition-colors duration-200"
        aria-label="Toggle mobile menu"
      >
        <svg
          className={`w-6 h-6 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-200 z-50">
          <div className="px-4 py-6 space-y-4">
            {mobileNavigationItems.map((item) => (
              <div key={item.label}>
                {item.href ? (
                  <Link
                    to={item.href}
                    className="block py-3 text-lg font-medium text-gray-900 hover:text-brand-red transition-colors duration-200"
                    onClick={toggleMenu}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleItem(item.label)}
                      className="flex items-center justify-between w-full py-3 text-lg font-medium text-gray-900 hover:text-brand-red transition-colors duration-200"
                    >
                      {item.label}
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${
                          expandedItems.includes(item.label) ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedItems.includes(item.label) && item.items && (
                      <div className="ml-4 mt-2 space-y-3">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.label}
                            to={subItem.href}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                            onClick={toggleMenu}
                          >
                            <span className="text-xl">{subItem.icon}</span>
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-brand-red transition-colors duration-200">
                                {subItem.label}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {subItem.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile CTA Buttons */}
            <div className="pt-6 border-t border-gray-200 space-y-3">
              <Button className="w-full bg-brand-yellow text-brand-red hover:bg-brand-orange hover:text-white">
                Watch Demo (90s)
              </Button>
              <Button variant="outline" className="w-full border-brand-red text-brand-red hover:bg-brand-red hover:text-white">
                Sign In
              </Button>
              <Button className="w-full bg-brand-red text-white hover:bg-brand-orange">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 