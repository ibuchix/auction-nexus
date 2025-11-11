
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { edgeFunctionAdminOperations } from '@/utils/edgeFunctionAdminOperations';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AdminContextType = {
  isAdmin: boolean;
  isLoading: boolean;
  userId: string | null;
  operations: typeof edgeFunctionAdminOperations;
};

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  isLoading: true,
  userId: null,
  operations: edgeFunctionAdminOperations,
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading, userId } = useAdminAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only show error toast if admin check definitively failed after loading is complete
    // Add a delay to prevent false alarms during initial authentication
    if (isAdmin === false && !isLoading) {
      const timer = setTimeout(() => {
        console.log('[AdminContext] Admin check failed after loading complete');
        toast.error('Admin access error. Check your JWT and service role key configuration.');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAdmin, isLoading]);
  
  const value = {
    isAdmin,
    isLoading,
    userId,
    operations: edgeFunctionAdminOperations,
  };
  
  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
