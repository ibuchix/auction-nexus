
import { Dispute } from "@/types/disputes";
import { format } from "date-fns";

interface ResolutionSectionProps {
  dispute: Dispute;
  currentStatus: string;
}

export function ResolutionSection({ dispute, currentStatus }: ResolutionSectionProps) {
  if (currentStatus !== 'resolved' || !dispute.resolution) return null;

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Resolution</h4>
      <div className="p-4 bg-green-50 rounded-md">
        <p className="whitespace-pre-wrap">{dispute.resolution}</p>
        <p className="text-sm text-gray-500 mt-2">
          Resolved on {format(new Date(dispute.resolved_at!), 'PPP')}
        </p>
      </div>
    </div>
  );
}
