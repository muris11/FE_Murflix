import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthContextType } from '@/types/auth';
import { authApi } from '@/api/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('murflix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('murflix_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const userData = await authApi.me();
      setUser(userData);
      localStorage.setItem('murflix_user', JSON.stringify(userData));
    } catch (err) {
      console.error('Failed to refresh user:', err);
      setUser(null);
      localStorage.removeItem('murflix_token');
      localStorage.removeItem('murflix_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('murflix_token', res.token);
      localStorage.setItem('murflix_user', JSON.stringify(res.user));
      setUser(res.user);
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Login gagal';
      return { success: false, error: message };
    }
  };

  const loginDemo = async () => {
    try {
      const res = await authApi.demoLogin();
      localStorage.setItem('murflix_token', res.token);
      localStorage.setItem('murflix_user', JSON.stringify(res.user));
      setUser(res.user);
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Login demo gagal';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('murflix_token');
      localStorage.removeItem('murflix_user');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isSubscriptionValid =
    isAdmin ||
    user?.subscription_status === 'forever' ||
    user?.subscription_status === 'active';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        isSubscriptionValid,
        login,
        loginDemo,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

