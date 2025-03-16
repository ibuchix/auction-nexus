
import { Badge } from "@/components/ui/badge";
import { VerificationStatus as VerificationStatusType } from "../types";

interface VerificationStatusProps {
  status: VerificationStatusType;
  createdAt: string;
}

const VerificationStatus = ({ status, createdAt }: VerificationStatusProps) => {
  const getStatusBadge = (status: VerificationStatusType) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gradient-to-r from-yellow-200 to-amber-200 text-amber-800 border-yellow-300 shadow-sm">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-gradient-to-r from-green-200 to-emerald-200 text-emerald-800 border-green-300 shadow-sm">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-gradient-to-r from-red-200 to-rose-200 text-red-800 border-red-300 shadow-sm">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500">Verification Status</h3>
      <div className="mt-2">
        {getStatusBadge(status)}
        <p className="text-xs text-gray-500 mt-1">
          Submitted on {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default VerificationStatus;
