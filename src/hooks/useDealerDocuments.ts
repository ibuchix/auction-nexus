import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      const { data, error } = await supabase
        .from('dealer_documents')
        .select('*')
        .eq('dealer_id', dealerId)
        .order('uploaded_at', { ascending: false });

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
      const { data, error } = await supabase.storage
        .from('dealer-documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

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