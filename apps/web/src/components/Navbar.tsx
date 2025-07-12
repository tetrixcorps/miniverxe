import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { AnimatedLogo } from './AnimatedLogo';
import { NavigationMenu } from './navigation/NavigationMenu';
import { MobileNavigation } from './navigation/MobileNavigation';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const location = useLocation();
  const { user, userGroup, canAccessClientLogin, signIn, signOut } = useAuth();

  const handleClientLogin = async () => {
    if (!user) {
      // If not logged in, sign in as enterprise user
      await signIn('enterprise');
    } else if (userGroup !== 'enterprise') {
      // If logged in but wrong user group, show error
      alert('Only Enterprise customers can access Client Login. Please contact support for access.');
    } else {
      // If logged in as enterprise user, redirect to customer dashboard
      window.location.href = '/customer/dashboard';
    }
  };

  return (
    <header className="w-full bg-gradient-to-r from-brand-red via-brand-orange to-brand-yellow text-white shadow-lg relative">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <AnimatedLogo size="md" showText={false} />
          <span
            className="
              text-2xl md:text-3xl font-extrabold
              text-white
              tracking-wide drop-shadow-lg
              transition-all duration-300
              group-hover:scale-105
            "
          >
            TETRIX
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu />

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-white text-sm">
                Welcome, {user.displayName || user.email}
              </span>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-brand-red transition-colors"
                onClick={signOut}
              >
                Sign Out
              </Button>
              {canAccessClientLogin() && (
                <Button 
                  className="
                    bg-gradient-to-r from-red-600 via-red-500 to-red-700 
                    hover:from-red-700 hover:via-red-600 hover:to-red-800
                    text-white font-bold px-6 py-2 
                    shadow-lg hover:shadow-xl 
                    transition-all duration-300 
                    transform hover:scale-105
                    border-0
                  "
                  onClick={handleClientLogin}
                >
                  Client Login
                </Button>
              )}
            </>
          ) : (
            <Button 
              className="
                bg-gradient-to-r from-red-600 via-red-500 to-red-700 
                hover:from-red-700 hover:via-red-600 hover:to-red-800
                text-white font-bold px-6 py-2 
                shadow-lg hover:shadow-xl 
                transition-all duration-300 
                transform hover:scale-105
                border-0
              "
              onClick={handleClientLogin}
            >
              Client Login
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation />
      </div>
    </header>
  );
} 