
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
  
  useEffect(() => {
    if (isAdmin === false && !isLoading) {
      toast.error('Admin access error. Check your service role key in .env file or Supabase permissions.');
    }
  }, [isAdmin, isLoading]);
  
  const value = {
    isAdmin,
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
