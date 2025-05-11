
import { useState, useEffect } from 'react';
import { adminSupabase } from '@/integrations/supabase/adminClient';
import { useToast } from '@/hooks/use-toast';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false); 
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Simply check if admin client works by trying a simple database operation
    const checkAdminClient = async () => {
      setIsLoading(true);
      try {
        // Test if admin client can access the cars table (the one having issues)
        const { data, error } = await adminSupabase
          .from('cars')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error('Admin client error:', error);
          toast({
            title: "Admin Access Error",
            description: "Failed to access data with admin privileges. Check the service role key in environment variables.",
            variant: "destructive",
          });
          setIsAdmin(false);
        } else {
          console.log('Admin client working successfully');
          // Use a placeholder user ID for admin operations
          setUserId("admin-user");
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Error testing admin client:', err);
        toast({
          title: "Admin Client Error",
          description: "Error connecting to database with admin privileges",
          variant: "destructive",
        });
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminClient();
  }, [toast]);
  
  return { isAdmin, isLoading, userId };
}
