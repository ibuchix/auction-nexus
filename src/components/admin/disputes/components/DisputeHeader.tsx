
import { Dispute } from "@/types/disputes";
import { format } from "date-fns";

interface DisputeHeaderProps {
  dispute: Dispute;
  currentStatus: string;
  getStatusBadge: (status: string) => JSX.Element;
}

export function DisputeHeader({ dispute, currentStatus, getStatusBadge }: DisputeHeaderProps) {
  return (
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
  );
}
