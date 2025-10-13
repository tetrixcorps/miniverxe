import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as fbSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Roles, Permissions } from '../../../../packages/rbac';
import type { Role, Permission } from '../../../../packages/rbac';

interface AuthContextType {
  user: any;
  roles: Role[];
  permissions: Permission[];
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        const claims = tokenResult.claims || {};
        setUser(firebaseUser);
        setRoles(toRoleArray(claims.roles));
        setPermissions(toPermissionArray(claims.permissions));
      } else {
        setUser(null);
        setRoles([]);
        setPermissions([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await fbSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, roles, permissions, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}; 