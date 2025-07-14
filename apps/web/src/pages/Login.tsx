import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth } from '../hooks/useAuth';
import OAuthLogin from '../components/auth/OAuthLogin';
import type { UserGroup } from '../providers/AuthProvider';
import { useEnterpriseAuth } from '../hooks/useEnterpriseAuth';

export default function Login() {
  const [selectedUserGroup, setSelectedUserGroup] = useState<UserGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOAuth, setShowOAuth] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Pre-select group from query string if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const group = params.get('group');
    if (group === 'enterprise' || group === 'academy' || group === 'data-annotator') {
      setSelectedUserGroup(group as UserGroup);
    }
  }, [location.search]);

  // Enterprise RBAC check
  const { isEnterpriseUser, error: enterpriseError } = useEnterpriseAuth();

  const handleUserGroupSelection = (userGroup: UserGroup) => {
    setSelectedUserGroup(userGroup);
  };

  const handleSignIn = async () => {
    if (!selectedUserGroup) {
      alert('Please select a user group first.');
      return;
    }
    setLoading(true);
    try {
      await signIn(selectedUserGroup);
      // Redirect based on user group
      switch (selectedUserGroup) {
        case 'data-annotator':
          navigate('/data-labeling/dashboard');
          break;
        case 'academy':
          navigate('/academy/dashboard');
          break;
        case 'enterprise':
          // Only allow if enterprise RBAC passes
          if (isEnterpriseUser) {
            navigate('/customer/dashboard');
          } else {
            // Error will be handled by useEnterpriseAuth
          }
          break;
        default:
          navigate(from);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const userGroups = [
    {
      id: 'data-annotator' as UserGroup,
      title: 'Data Annotator',
      description: 'Access data labeling tools and project management',
      icon: '🏷️',
      color: 'bg-brand-yellow',
      textColor: 'text-brand-red'
    },
    {
      id: 'academy' as UserGroup,
      title: 'Code Academy',
      description: 'Access learning resources and course materials',
      icon: '🎓',
      color: 'bg-white',
      textColor: 'text-brand-red'
    },
    {
      id: 'enterprise' as UserGroup,
      title: 'Enterprise Client',
      description: 'Access enterprise features and client portal',
      icon: '🏢',
      color: 'bg-brand-red',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">Welcome to TETRIX</h1>
          <p className="text-gray-600">Choose your user group to continue</p>
        </div>

        {enterpriseError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
            {enterpriseError}
          </div>
        )}

        {!showOAuth ? (
          <>
            <div className="space-y-4 mb-8">
              {userGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => handleUserGroupSelection(group.id)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                    ${selectedUserGroup === group.id 
                      ? `${group.color} ${group.textColor} border-brand-red shadow-lg` 
                      : 'bg-white border-gray-200 hover:border-brand-red hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{group.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold">{group.title}</h3>
                      <p className="text-sm opacity-75">{group.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSignIn}
              disabled={!selectedUserGroup || loading}
              className="w-full bg-brand-red text-white hover:bg-brand-orange disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Continue with Google'}
            </Button>

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowOAuth(true)}
                className="text-sm text-blue-600 hover:text-blue-500 underline"
              >
                Or sign in with other providers
              </button>
            </div>
          </>
        ) : (
          <OAuthLogin
            onSuccess={(user) => {
              // Redirect based on user group (OAuth users default to enterprise)
              navigate('/customer/dashboard');
            }}
            onError={(error) => {
              console.error('OAuth error:', error);
              alert('OAuth login failed. Please try again.');
            }}
          />
        )}

        {showOAuth && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowOAuth(false)}
              className="text-sm text-gray-600 hover:text-gray-500 underline"
            >
              Back to Google Sign In
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </Card>
    </div>
  );
} 