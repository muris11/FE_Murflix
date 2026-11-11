import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppRoutes } from '@/routes/AppRoutes';
import { useVisitorTracking } from '@/hooks/useVisitorTracking';

const VisitorTracker: React.FC = () => {
  useVisitorTracking();
  return null;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <VisitorTracker />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
