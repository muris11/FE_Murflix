import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthContextType } from '@/types/auth';
import { UserProfile } from '@/types/profile';
import { authApi } from '@/api/auth';
import { profilesApi } from '@/api/profiles';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('murflix_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('murflix_active_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoading, setIsLoading] = useState(true);

  const refreshProfiles = useCallback(async () => {
    try {
      const token = localStorage.getItem('murflix_token');
      if (!token) {
        setProfiles([]);
        setActiveProfile(null);
        return;
      }
      const data = await profilesApi.getProfiles();
      setProfiles(data || []);

      // Only restore active profile if it was previously saved and still exists
      const savedActive = localStorage.getItem('murflix_active_profile');
      let foundActive: UserProfile | null = null;
      if (savedActive) {
        try {
          const parsed = JSON.parse(savedActive);
          foundActive = data.find((p) => p.id === parsed.id) || null;
        } catch {
          foundActive = null;
        }
      }
      setActiveProfile(foundActive);
      if (foundActive) {
        localStorage.setItem('murflix_active_profile', JSON.stringify(foundActive));
      } else {
        localStorage.removeItem('murflix_active_profile');
      }
    } catch (err) {
      console.error('Failed to load profiles:', err);
    }
  }, []);

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
      await refreshProfiles();
    } catch (err) {
      console.error('Failed to refresh user:', err);
      setUser(null);
      localStorage.removeItem('murflix_token');
      localStorage.removeItem('murflix_user');
      localStorage.removeItem('murflix_active_profile');
    } finally {
      setIsLoading(false);
    }
  }, [refreshProfiles]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const selectProfile = (profile: UserProfile) => {
    setActiveProfile(profile);
    localStorage.setItem('murflix_active_profile', JSON.stringify(profile));
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('murflix_token', res.token);
      localStorage.setItem('murflix_user', JSON.stringify(res.user));
      // Fresh login requires profile selection (1:1 Netflix flow)
      localStorage.removeItem('murflix_active_profile');
      setActiveProfile(null);
      setUser(res.user);
      await refreshProfiles();
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
      // Fresh demo login requires profile selection (1:1 Netflix flow)
      localStorage.removeItem('murflix_active_profile');
      setActiveProfile(null);
      setUser(res.user);
      await refreshProfiles();
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
      localStorage.removeItem('murflix_active_profile');
      setUser(null);
      setProfiles([]);
      setActiveProfile(null);
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
        activeProfile,
        profiles,
        isLoading,
        isAuthenticated,
        isAdmin,
        isSubscriptionValid,
        login,
        loginDemo,
        logout,
        refreshUser,
        selectProfile,
        refreshProfiles,
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

