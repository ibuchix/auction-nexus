
import { Dispute } from "@/types/disputes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DisputeComments } from "./DisputeComments";
import { useState } from "react";
import { DisputeResolutionForm } from "./DisputeResolutionForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DisputeHeader } from "./components/DisputeHeader";
import { SubmittedBySection } from "./components/SubmittedBySection";
import { RelatedVehicleSection } from "./components/RelatedVehicleSection";
import { ResolutionSection } from "./components/ResolutionSection";
import { DisputeActions } from "./components/DisputeActions";

interface DisputeDetailDialogProps {
  dispute: Dispute;
  open: boolean;
  onClose: () => void;
  onDisputeUpdated: () => void;
}

export function DisputeDetailDialog({ dispute, open, onClose, onDisputeUpdated }: DisputeDetailDialogProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(dispute.status);
  const { toast } = useToast();
  
  const handleUpdateStatus = async (newStatus: 'open' | 'investigating' | 'resolved' | 'closed') => {
    try {
      const { error } = await supabase
        .from('disputes')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'resolved' ? { resolved_at: new Date().toISOString() } : {})
        })
        .eq('id', dispute.id);
        
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Dispute status changed to ${newStatus}`,
      });
      
      setCurrentStatus(newStatus);
      onDisputeUpdated();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleAssignToMe = async () => {
    try {
      // In a real application, you would get the current admin user ID
      const adminId = "00000000-0000-0000-0000-000000000000"; // Placeholder admin ID
      
      const { error } = await supabase
        .from('disputes')
        .update({ 
          assigned_to: adminId,
          updated_at: new Date().toISOString()
        })
        .eq('id', dispute.id);
        
      if (error) throw error;
      
      toast({
        title: "Dispute assigned",
        description: "This dispute has been assigned to you",
      });
      
      onDisputeUpdated();
    } catch (error: any) {
      toast({
        title: "Error assigning dispute",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Dispute Case #{dispute.id.slice(0, 8)}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="flex flex-col gap-6">
              <DisputeHeader 
                dispute={dispute} 
                currentStatus={currentStatus} 
              />
              
              <div>
                <h3 className="text-lg font-medium">{dispute.title}</h3>
                <p className="mt-2 whitespace-pre-wrap">{dispute.description}</p>
              </div>
              
              <Separator />
              
              <SubmittedBySection dispute={dispute} />
              
              {dispute.car_id && (
                <>
                  <Separator />
                  <RelatedVehicleSection dispute={dispute} />
                </>
              )}
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                  <h4 className="font-medium">Discussion</h4>
                </div>
                <DisputeComments disputeId={dispute.id} onNewComment={onDisputeUpdated} />
              </div>
              
              {currentStatus === 'resolved' && dispute.resolution && (
                <>
                  <Separator />
                  <ResolutionSection dispute={dispute} currentStatus={currentStatus} />
                </>
              )}
            </div>
          </ScrollArea>
          
          <DisputeActions
            currentStatus={currentStatus}
            onUpdateStatus={handleUpdateStatus}
            onAssignToMe={handleAssignToMe}
            onStartResolving={() => setIsResolving(true)}
            assignedTo={dispute.assigned_to}
            onClose={onClose}
          />
        </div>
        
        {isResolving && (
          <DisputeResolutionForm
            disputeId={dispute.id}
            onCancel={() => setIsResolving(false)}
            onResolved={() => {
              setIsResolving(false);
              setCurrentStatus('resolved');
              onDisputeUpdated();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
