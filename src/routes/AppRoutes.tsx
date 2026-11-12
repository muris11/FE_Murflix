import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppShell } from '@/components/layout/AppShell';

// Code-split all page routes with React.lazy
const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const LandingPage = lazy(() => import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SubscriptionExpiredPage = lazy(() => import('@/pages/SubscriptionExpiredPage').then((m) => ({ default: m.SubscriptionExpiredPage })));
const MovieDetailPage = lazy(() => import('@/pages/MovieDetailPage').then((m) => ({ default: m.MovieDetailPage })));
const TVDetailPage = lazy(() => import('@/pages/TVDetailPage').then((m) => ({ default: m.TVDetailPage })));
const WatchPage = lazy(() => import('@/pages/WatchPage').then((m) => ({ default: m.WatchPage })));
const BrowsePage = lazy(() => import('@/pages/BrowsePage').then((m) => ({ default: m.BrowsePage })));
const SearchPage = lazy(() => import('@/pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const MyListPage = lazy(() => import('@/pages/MyListPage').then((m) => ({ default: m.MyListPage })));
const ProfilesPage = lazy(() => import('@/pages/ProfilesPage').then((m) => ({ default: m.ProfilesPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

// Admin Pages Code-Split
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminUserCreatePage = lazy(() => import('@/pages/admin/AdminUserCreatePage').then((m) => ({ default: m.AdminUserCreatePage })));
const AdminUserEditPage = lazy(() => import('@/pages/admin/AdminUserEditPage').then((m) => ({ default: m.AdminUserEditPage })));
const AdminPricingPage = lazy(() => import('@/pages/admin/AdminPricingPage').then((m) => ({ default: m.AdminPricingPage })));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/analytics/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage })));
const AdminVisitorLogsPage = lazy(() => import('@/pages/admin/analytics/AdminVisitorLogsPage').then((m) => ({ default: m.AdminVisitorLogsPage })));
const AdminServersSettingsPage = lazy(() => import('@/pages/admin/settings/AdminServersSettingsPage').then((m) => ({ default: m.AdminServersSettingsPage })));
const AdminTmdbSettingsPage = lazy(() => import('@/pages/admin/settings/AdminTmdbSettingsPage').then((m) => ({ default: m.AdminTmdbSettingsPage })));
const AdminDemoSettingsPage = lazy(() => import('@/pages/admin/settings/AdminDemoSettingsPage').then((m) => ({ default: m.AdminDemoSettingsPage })));
const AdminWhatsAppSettingsPage = lazy(() => import('@/pages/admin/settings/AdminWhatsAppSettingsPage').then((m) => ({ default: m.AdminWhatsAppSettingsPage })));
const AdminGeneralSettingsPage = lazy(() => import('@/pages/admin/settings/AdminGeneralSettingsPage').then((m) => ({ default: m.AdminGeneralSettingsPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
    <div className="w-10 h-10 rounded-full border-2 border-zinc-700 border-t-red-600 animate-spin" />
  </div>
);

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isSubscriptionValid, isLoading, isAdmin, activeProfile } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (!isAdmin && !isSubscriptionValid) {
    return <Navigate to="/subscription-expired" replace />;
  }

  // Enforce profile selection first (1:1 Netflix flow)
  if (!activeProfile && location.pathname !== '/profiles') {
    const dest = location.pathname !== '/'
      ? `/profiles?redirect=${encodeURIComponent(location.pathname + location.search)}`
      : '/profiles';
    return <Navigate to={dest} replace />;
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
  const { isAuthenticated, isLoading, activeProfile } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (!activeProfile) {
      return <Navigate to="/profiles" replace />;
    }
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
      <Suspense fallback={<PageLoadingFallback />}>
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
        <Route
          path="/profiles"
          element={
            <ProtectedRoute>
              <ProfilesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
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
          path="/admin/analytics"
          element={
            <AdminRoute>
              <AdminAnalyticsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/analytics/logs"
          element={
            <AdminRoute>
              <AdminVisitorLogsPage />
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
        <Route
          path="/admin/settings/servers"
          element={
            <AdminRoute>
              <AdminServersSettingsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings/tmdb"
          element={
            <AdminRoute>
              <AdminTmdbSettingsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings/demo"
          element={
            <AdminRoute>
              <AdminDemoSettingsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings/whatsapp"
          element={
            <AdminRoute>
              <AdminWhatsAppSettingsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings/general"
          element={
            <AdminRoute>
              <AdminGeneralSettingsPage />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </AppShell>
  );
};

