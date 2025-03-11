
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface DisputeResolutionFormProps {
  disputeId: string;
  onCancel: () => void;
  onResolved: () => void;
}

export function DisputeResolutionForm({ disputeId, onCancel, onResolved }: DisputeResolutionFormProps) {
  const [resolution, setResolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!resolution.trim()) {
      toast({
        title: "Resolution required",
        description: "Please provide a resolution summary",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('disputes')
        .update({
          status: 'resolved',
          resolution: resolution.trim(),
          resolved_at: now,
          updated_at: now
        })
        .eq('id', disputeId);
        
      if (error) throw error;
      
      toast({
        title: "Dispute resolved",
        description: "The dispute has been marked as resolved",
      });
      
      onResolved();
    } catch (error: any) {
      toast({
        title: "Error resolving dispute",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Dispute</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Please provide a summary of how this dispute was resolved. This information will be 
            available to all parties involved in the dispute.
          </p>
          
          <Textarea
            placeholder="Enter resolution details..."
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!resolution.trim() || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mark as Resolved
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
