'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, DepartmentId } from '@/types';
import { authAPI, saveAuthToken, removeAuthToken, decodeToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole, department?: DepartmentId) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = decodeToken(token);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          // Token is valid
          const userData: User = {
            id: decoded.sub,
            email: decoded.email || '',
            role: decoded.role as UserRole,
            departments: decoded.department_ids || [],
          };
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token expired
          removeAuthToken();
        }
      } catch (error) {
        console.error('Invalid token:', error);
        removeAuthToken();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole, department?: DepartmentId): Promise<boolean> => {
    try {
      const response = await authAPI.login({ email, password, role, department });
      
      // Save token
      saveAuthToken(response.access_token);
      
      // Decode token to get user info
      const decoded = decodeToken(response.access_token);
      
      const userData: User = {
        id: decoded.sub,
        email: email,
        role: role, // Use the selected role
        departments: decoded.department_ids || [],
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    removeAuthToken();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
