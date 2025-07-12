import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

interface NavigationItem {
  label: string;
  href?: string;
  items?: {
    label: string;
    description: string;
    href: string;
    icon?: string;
  }[];
}

const navigationItems: NavigationItem[] = [
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

export function NavigationMenu() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = (label: string) => {
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <nav className="hidden md:flex items-center space-x-8" ref={dropdownRef}>
      {navigationItems.map((item) => (
        <div
          key={item.label}
          className="relative"
          onMouseEnter={() => handleMouseEnter(item.label)}
          onMouseLeave={handleMouseLeave}
        >
          {item.href ? (
            <Link
              to={item.href}
              className="text-gray-700 hover:text-brand-red font-medium transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <button
              className="text-gray-700 hover:text-brand-red font-medium transition-colors duration-200 flex items-center gap-1"
            >
              {item.label}
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  activeDropdown === item.label ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {item.items && activeDropdown === item.label && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="p-4">
                <div className="grid gap-3">
                  {item.items.map((subItem) => (
                    <Link
                      key={subItem.label}
                      to={subItem.href}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                    >
                      <span className="text-2xl">{subItem.icon}</span>
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
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
} 