
import { Button } from "@/components/ui/button";

interface DisputeActionsProps {
  currentStatus: string;
  onUpdateStatus: (status: 'open' | 'investigating' | 'resolved' | 'closed') => Promise<void>;
  onAssignToMe: () => Promise<void>;
  onStartResolving: () => void;
  assignedTo: any;
  onClose: () => void;
}

export function DisputeActions({ 
  currentStatus, 
  onUpdateStatus, 
  onAssignToMe, 
  onStartResolving, 
  assignedTo,
  onClose 
}: DisputeActionsProps) {
  return (
    <div className="flex justify-between mt-6">
      <div className="space-x-2">
        {currentStatus === 'open' && (
          <Button 
            variant="secondary" 
            onClick={() => onUpdateStatus('investigating')}
          >
            Begin Investigation
          </Button>
        )}
        
        {currentStatus === 'investigating' && (
          <Button 
            variant="default" 
            onClick={onStartResolving}
          >
            Resolve Dispute
          </Button>
        )}
        
        {!assignedTo && (
          <Button variant="outline" onClick={onAssignToMe}>
            Assign to Me
          </Button>
        )}
      </div>
      
      <Button variant="outline" onClick={onClose}>
        Close
      </Button>
    </div>
  );
}
