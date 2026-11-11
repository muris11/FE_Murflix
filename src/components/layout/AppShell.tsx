import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const path = location.pathname;

  const isAdminRoute = path.startsWith('/admin');
  const isAuthRoute = path === '/login' || path === '/subscription-expired';
  const isWatchRoute = path.startsWith('/watch');
  const isLandingRoute = (!isAuthenticated && path === '/') || path === '/welcome' || path === '/about';
  const isProfilesRoute = path === '/profiles';

  const hideNavAndFooter = isAdminRoute || isAuthRoute || isWatchRoute || isLandingRoute || isProfilesRoute;

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col justify-between">
      {!hideNavAndFooter && <Navbar />}
      <main className={`flex-grow ${!hideNavAndFooter ? 'pb-24 md:pb-0' : ''}`}>{children}</main>
      {!hideNavAndFooter && <Footer />}
      {!hideNavAndFooter && <MobileBottomNav />}
    </div>
  );
};
