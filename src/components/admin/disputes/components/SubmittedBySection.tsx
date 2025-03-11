
import { Dispute } from "@/types/disputes";
import { User } from "lucide-react";

interface SubmittedBySectionProps {
  dispute: Dispute;
}

export function SubmittedBySection({ dispute }: SubmittedBySectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-gray-400" />
        <h4 className="font-medium">Submitted By</h4>
      </div>
      <div className="pl-7">
        <p>{dispute.submitted_by?.full_name || "Unknown"}</p>
      </div>
    </div>
  );
}
