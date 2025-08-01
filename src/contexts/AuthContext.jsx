'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth_token='))
      ?.split('=')[1];
    console.log('AuthContext: Checking token on mount:', token, 'Path:', pathname);
    if (token) {
      try {
        const decoded = JSON.parse(atob(token));
        console.log('AuthContext: Decoded token:', decoded);
        if (decoded.username === 'admin') {
          setIsAuthenticated(true);
          console.log('AuthContext: User authenticated');
        }
      } catch (error) {
        console.error('AuthContext: Invalid token:', error);
      }
    }
    setIsAuthLoading(false);
  }, []);

  const login = (username, password) => {
    console.log('Login attempt:', { username, password });
    if (username === 'admin' && password === '123') {
      const token = btoa(JSON.stringify({ username: 'admin' }));
      console.log('Setting cookie:', token);
      document.cookie = `auth_token=${token}; path=/; SameSite=Strict; max-age=86400`;
      setIsAuthenticated(true);
      console.log('isAuthenticated set to true');
      toast.success('Connexion réussie');
      setTimeout(() => {
        console.log('Redirecting to /');
        router.push('/');
        router.refresh();
      }, 100);
      return true;
    }
    toast.error('Nom d’utilisateur ou mot de passe incorrect');
    return false;
  };

  const logout = () => {
    console.log('Logging out');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setIsAuthenticated(false);
    toast.info('Déconnexion réussie');
    router.push('/login');
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);