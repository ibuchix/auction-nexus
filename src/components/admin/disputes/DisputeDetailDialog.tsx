
import { Dispute } from "@/types/disputes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { DisputeComments } from "./DisputeComments";
import { useState } from "react";
import { DisputeResolutionForm } from "./DisputeResolutionForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Car, MessageSquare, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-orange-100 text-orange-800">Open</Badge>;
      case 'investigating':
        return <Badge className="bg-blue-100 text-blue-800">Investigating</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div>{getStatusBadge(currentStatus)}</div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p>{dispute.type.replace('_', ' ')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p>{format(new Date(dispute.created_at), 'PPP p')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p>{format(new Date(dispute.updated_at), 'PPP p')}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">{dispute.title}</h3>
                <p className="mt-2 whitespace-pre-wrap">{dispute.description}</p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <h4 className="font-medium">Submitted By</h4>
                </div>
                <div className="pl-7">
                  <p>{dispute.submitted_by?.full_name || "Unknown"}</p>
                </div>
              </div>
              
              {dispute.car_id && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-gray-400" />
                      <h4 className="font-medium">Related Vehicle</h4>
                    </div>
                    <div className="pl-7 space-y-2">
                      <p className="font-medium">{dispute.car_id.title || `${dispute.car_id.make} ${dispute.car_id.model} ${dispute.car_id.year}`}</p>
                      {dispute.car_id.images && dispute.car_id.images.length > 0 && (
                        <div className="mt-2">
                          <img 
                            src={dispute.car_id.images[0]} 
                            alt="Vehicle" 
                            className="w-full max-w-sm rounded-md object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
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
                  <div className="space-y-4">
                    <h4 className="font-medium">Resolution</h4>
                    <div className="p-4 bg-green-50 rounded-md">
                      <p className="whitespace-pre-wrap">{dispute.resolution}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Resolved on {format(new Date(dispute.resolved_at!), 'PPP')}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex justify-between mt-6">
            <div className="space-x-2">
              {currentStatus === 'open' && (
                <Button 
                  variant="secondary" 
                  onClick={() => handleUpdateStatus('investigating')}
                >
                  Begin Investigation
                </Button>
              )}
              
              {currentStatus === 'investigating' && (
                <Button 
                  variant="default" 
                  onClick={() => setIsResolving(true)}
                >
                  Resolve Dispute
                </Button>
              )}
              
              {!dispute.assigned_to && (
                <Button variant="outline" onClick={handleAssignToMe}>
                  Assign to Me
                </Button>
              )}
            </div>
            
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
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
