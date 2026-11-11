import React from 'react';
import { Navigate } from 'react-router-dom';

export const AdminSettingsPage: React.FC = () => {
  return <Navigate to="/admin/settings/servers" replace />;
};
