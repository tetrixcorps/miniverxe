import React from 'react';
import { AnimatedLogo } from '../components/AnimatedLogo';
import { LottieLogo, AdvancedLottieLogo } from '../components/LottieLogo';

export default function LogoDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          TETRIX Logo Animation Demo
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* SVG Animated Logo */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">SVG Animated Logo</h2>
            <div className="flex justify-center mb-4">
              <AnimatedLogo size="lg" />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Pure SVG animation with CSS transitions and hover effects
            </p>
          </div>

          {/* Lottie Logo */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Lottie Logo</h2>
            <div className="flex justify-center mb-4">
              <LottieLogo size="lg" />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Lottie animation with autoplay and loop
            </p>
          </div>

          {/* Advanced Lottie Logo */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Advanced Lottie Logo</h2>
            <div className="flex justify-center mb-4">
              <AdvancedLottieLogo size="lg" />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Interactive Lottie with hover controls and speed changes
            </p>
          </div>

          {/* Small Variants */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Small Variants</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SVG:</span>
                <AnimatedLogo size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lottie:</span>
                <LottieLogo size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Advanced:</span>
                <AdvancedLottieLogo size="sm" />
              </div>
            </div>
          </div>

          {/* Medium Variants */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Medium Variants</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SVG:</span>
                <AnimatedLogo size="md" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lottie:</span>
                <LottieLogo size="md" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Advanced:</span>
                <AdvancedLottieLogo size="md" />
              </div>
            </div>
          </div>

          {/* Logo Only Variants */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Logo Only (No Text)</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SVG:</span>
                <AnimatedLogo size="md" showText={false} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lottie:</span>
                <LottieLogo size="md" showText={false} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Advanced:</span>
                <AdvancedLottieLogo size="md" showText={false} />
              </div>
            </div>
          </div>

        </div>

        {/* Usage Instructions */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Usage Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-600">SVG Animated Logo</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { AnimatedLogo } from './components/AnimatedLogo';

<AnimatedLogo 
  size="md" 
  showText={true} 
  className="custom-class" 
/>`}
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-600">Lottie Logo</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { LottieLogo } from './components/LottieLogo';

<LottieLogo 
  size="md" 
  showText={true} 
  autoplay={true} 
  loop={true} 
/>`}
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-600">Advanced Lottie Logo</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { AdvancedLottieLogo } from './components/LottieLogo';

<AdvancedLottieLogo 
  size="lg" 
  showText={true} 
/>`}
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-600">Available Props</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><code>size</code>: 'sm' | 'md' | 'lg'</li>
                <li><code>showText</code>: boolean</li>
                <li><code>className</code>: string</li>
                <li><code>autoplay</code>: boolean (Lottie only)</li>
                <li><code>loop</code>: boolean (Lottie only)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">SVG</span>
              </div>
              <h3 className="font-medium mb-2">SVG Animations</h3>
              <p className="text-sm text-gray-600">
                Pure SVG with CSS animations, lightweight and performant
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">Lottie</span>
              </div>
              <h3 className="font-medium mb-2">Lottie Animations</h3>
              <p className="text-sm text-gray-600">
                Professional animations with advanced controls and effects
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">Interactive</span>
              </div>
              <h3 className="font-medium mb-2">Interactive Controls</h3>
              <p className="text-sm text-gray-600">
                Hover effects, speed controls, and click interactions
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
} 