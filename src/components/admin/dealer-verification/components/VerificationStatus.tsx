
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
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
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
