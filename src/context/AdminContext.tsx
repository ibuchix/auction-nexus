
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
  
  // We're removing the redirect since this is an admin-only app
  // and we've modified useAdminAuth to assume admin privileges
  
  useEffect(() => {
    if (isAdmin === false) {
      toast.error('Admin client not working. Check your service role key.');
    }
  }, [isAdmin]);
  
  const value = {
    isAdmin: true, // Always return true for admin access
    isLoading: false,
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
