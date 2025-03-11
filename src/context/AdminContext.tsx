
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { adminOperations } from '@/utils/adminOperations';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AdminContextType = {
  isAdmin: boolean;
  isLoading: boolean;
  userId: string | null;
  operations: typeof adminOperations;
};

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  isLoading: true,
  userId: null,
  operations: adminOperations,
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading, userId } = useAdminAuth();
  const navigate = useNavigate();
  
  // Optional: Redirect non-admin users away from admin pages
  useEffect(() => {
    if (!isLoading && isAdmin === false && window.location.pathname.startsWith('/admin')) {
      toast.error('Access denied: Admin privileges required');
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);
  
  const value = {
    isAdmin: !!isAdmin,
    isLoading,
    userId,
    operations: adminOperations,
  };
  
  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
