import { useState, useEffect } from "react";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { toast } from "sonner";

interface DealerDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_type: string;
  verified: boolean;
  uploaded_at: string;
  verification_notes?: string;
}

export const useDealerDocuments = (dealerId: string | null) => {
  const [documents, setDocuments] = useState<DealerDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (dealerId) {
      fetchDocuments();
    }
  }, [dealerId]);

  const fetchDocuments = async () => {
    if (!dealerId) return;
    
    setIsLoading(true);
    try {
      console.log('Fetching documents for dealer ID:', dealerId);
      const { data, error } = await adminSupabase
        .from('dealer_documents')
        .select('*')
        .eq('dealer_id', dealerId)
        .order('uploaded_at', { ascending: false });

      console.log('Query result:', { data, error });
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching dealer documents:', error);
      toast.error('Failed to load dealer documents');
    } finally {
      setIsLoading(false);
    }
  };

  const getSignedUrl = async (filePath: string) => {
    try {
      console.log('Creating signed URL for:', filePath);
      const { data, error } = await adminSupabase.storage
        .from('dealer-documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      console.log('Signed URL result:', { data, error });
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error creating signed URL:', error);
      toast.error('Failed to access document');
      return null;
    }
  };

  return {
    documents,
    isLoading,
    refetch: fetchDocuments,
    getSignedUrl
  };
};