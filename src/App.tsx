import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppRoutes } from '@/routes/AppRoutes';
import { useVisitorTracking } from '@/hooks/useVisitorTracking';
import { InstallAppPrompt } from '@/components/pwa/InstallAppPrompt';
import { ScrollToTop } from '@/components/common/ScrollToTop';

const VisitorTracker: React.FC = () => {
  useVisitorTracking();
  return null;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <VisitorTracker />
      <AuthProvider>
        <AppRoutes />
        <InstallAppPrompt />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
