import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as fbSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Roles, Permissions } from '@tetrix/rbac';
import type { Role, Permission } from '@tetrix/rbac';

export type UserGroup = 'data-annotator' | 'academy' | 'enterprise';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  userGroup: UserGroup;
  roles: Role[];
  permissions: Permission[];
  isActive: boolean;
  lastLogin: Date;
}

interface AuthContextType {
  user: AuthUser | null;
  userGroup: UserGroup | null;
  roles: Role[];
  permissions: Permission[];
  loading: boolean;
  signIn: (userGroup?: UserGroup) => Promise<void>;
  signOut: () => Promise<void>;
  switchUserGroup: (userGroup: UserGroup) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: Role) => boolean;
  isUserGroup: (userGroup: UserGroup) => boolean;
  canAccessClientLogin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toRoleArray(val: unknown): Role[] {
  if (Array.isArray(val)) return val as Role[];
  if (typeof val === 'string') return [val as Role];
  return [];
}

function toPermissionArray(val: unknown): Permission[] {
  if (Array.isArray(val)) return val as Permission[];
  if (typeof val === 'string') return [val as Permission];
  return [];
}

function toUserGroup(val: unknown): UserGroup | null {
  if (typeof val === 'string' && ['data-annotator', 'academy', 'enterprise'].includes(val)) {
    return val as UserGroup;
  }
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userGroup, setUserGroup] = useState<UserGroup | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        const claims = tokenResult.claims || {};
        
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          userGroup: toUserGroup(claims.userGroup) || 'data-annotator',
          roles: toRoleArray(claims.roles),
          permissions: toPermissionArray(claims.permissions),
          isActive: claims.isActive !== false,
          lastLogin: new Date(),
        };

        setUser(authUser);
        setUserGroup(authUser.userGroup);
        setRoles(authUser.roles);
        setPermissions(authUser.permissions);
      } else {
        setUser(null);
        setUserGroup(null);
        setRoles([]);
        setPermissions([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (userGroup?: UserGroup) => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // If userGroup is specified, update the user's group
      if (userGroup && result.user) {
        // This would typically be done through a backend API call
        // For now, we'll simulate it by updating the token
        await result.user.getIdToken(true);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
  };

  const switchUserGroup = async (newUserGroup: UserGroup) => {
    if (!user) throw new Error('User must be authenticated to switch user groups');
    
    // This would typically be done through a backend API call
    // For now, we'll simulate it
    setUserGroup(newUserGroup);
  };

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasRole = (role: Role): boolean => {
    return roles.includes(role);
  };

  const isUserGroup = (group: UserGroup): boolean => {
    return userGroup === group;
  };

  const canAccessClientLogin = (): boolean => {
    // Only Enterprise users can access Client Login
    return userGroup === 'enterprise' && hasRole(Roles.SuperAdmin);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userGroup, 
      roles, 
      permissions, 
      loading, 
      signIn, 
      signOut, 
      switchUserGroup,
      hasPermission,
      hasRole,
      isUserGroup,
      canAccessClientLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}; 