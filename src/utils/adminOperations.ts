
import { adminSupabase } from '@/integrations/supabase/adminClient';
import { toast } from 'sonner';

// Generic admin operation handler with error handling
export async function performAdminOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T | null> {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    console.error(`Admin operation failed (${operationName}):`, error);
    toast.error(`Admin operation failed: ${(error as Error).message || 'Unknown error'}`);
    return null;
  }
}

// Example admin operations
export const adminOperations = {
  // Fetch all users (bypassing RLS)
  getAllUsers: async () => {
    return performAdminOperation('getAllUsers', async () => {
      const { data, error } = await adminSupabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data;
    });
  },
  
  // Update a user's role
  updateUserRole: async (userId: string, role: 'admin' | 'dealer' | 'seller') => {
    return performAdminOperation('updateUserRole', async () => {
      const { data, error } = await adminSupabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    });
  },

  // Suspend a user
  suspendUser: async (userId: string, suspended: boolean) => {
    return performAdminOperation('suspendUser', async () => {
      const { data, error } = await adminSupabase
        .from('profiles')
        .update({ suspended })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    });
  },
  
  // Admin function to verify a dealer
  verifyDealer: async (dealerId: string, adminId: string, notes?: string) => {
    return performAdminOperation('verifyDealer', async () => {
      const { data, error } = await adminSupabase.rpc(
        'verify_dealer',
        { p_dealer_id: dealerId, p_admin_id: adminId, p_notes: notes }
      );
      
      if (error) throw error;
      return data;
    });
  },
  
  // Admin function to reject a dealer
  rejectDealer: async (dealerId: string, adminId: string, rejectionReason: string, notes?: string) => {
    return performAdminOperation('rejectDealer', async () => {
      const { data, error } = await adminSupabase.rpc(
        'reject_dealer',
        { 
          p_dealer_id: dealerId, 
          p_admin_id: adminId,
          p_rejection_reason: rejectionReason,
          p_notes: notes 
        }
      );
      
      if (error) throw error;
      return data;
    });
  },
  
  // Admin function to log an action
  logAdminAction: async (
    adminId: string,
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, any>
  ) => {
    return performAdminOperation('logAdminAction', async () => {
      const { data, error } = await adminSupabase.rpc(
        'log_admin_action',
        {
          p_admin_id: adminId,
          p_action: action,
          p_entity_type: entityType,
          p_entity_id: entityId,
          p_details: details ? JSON.stringify(details) : null
        }
      );
      
      if (error) throw error;
      return data;
    });
  }
};
