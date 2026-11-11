import React from 'react';
import { AdminSidebar } from './AdminSidebar';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <main className="p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};

