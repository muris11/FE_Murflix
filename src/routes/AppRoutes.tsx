import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppShell } from '@/components/layout/AppShell';

import { HomePage } from '@/pages/HomePage';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SubscriptionExpiredPage } from '@/pages/SubscriptionExpiredPage';
import { MovieDetailPage } from '@/pages/MovieDetailPage';
import { TVDetailPage } from '@/pages/TVDetailPage';
import { WatchPage } from '@/pages/WatchPage';
import { BrowsePage } from '@/pages/BrowsePage';
import { SearchPage } from '@/pages/SearchPage';
import { MyListPage } from '@/pages/MyListPage';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminUserCreatePage } from '@/pages/admin/AdminUserCreatePage';
import { AdminUserEditPage } from '@/pages/admin/AdminUserEditPage';
import { AdminPricingPage } from '@/pages/admin/AdminPricingPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isSubscriptionValid, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isAdmin && !isSubscriptionValid) {
    return <Navigate to="/subscription-expired" replace />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

const RootRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    );
  }

  return <LandingPage />;
};

export const AppRoutes: React.FC = () => {
  return (
    <AppShell>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/welcome" element={<LandingPage />} />
        <Route path="/about" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/subscription-expired" element={<SubscriptionExpiredPage />} />

        {/* Member Content Routes */}
        <Route
          path="/movie/:id"
          element={
            <ProtectedRoute>
              <MovieDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watch/movie/:id"
          element={
            <ProtectedRoute>
              <WatchPage mediaType="movie" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tv/:id"
          element={
            <ProtectedRoute>
              <TVDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watch/tv/:id"
          element={
            <ProtectedRoute>
              <WatchPage mediaType="tv" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse/movies"
          element={
            <ProtectedRoute>
              <BrowsePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse/tv"
          element={
            <ProtectedRoute>
              <BrowsePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse/genre/:id"
          element={
            <ProtectedRoute>
              <BrowsePage />
            </ProtectedRoute>
          }
        />
        <Route path="/dramabox" element={<Navigate to="/browse/movies" replace />} />
        <Route path="/reelshort" element={<Navigate to="/browse/movies" replace />} />
        <Route path="/anime" element={<Navigate to="/browse/movies" replace />} />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-list"
          element={
            <ProtectedRoute>
              <MyListPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Management Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/create"
          element={
            <AdminRoute>
              <AdminUserCreatePage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:id/edit"
          element={
            <AdminRoute>
              <AdminUserEditPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/pricing"
          element={
            <AdminRoute>
              <AdminPricingPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminSettingsPage />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
};

