
import { Textarea } from "@/components/ui/textarea";

interface RejectionReasonInputProps {
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
}

const RejectionReasonInput = ({ 
  rejectionReason, 
  setRejectionReason 
}: RejectionReasonInputProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500">Rejection Reason</h3>
      <Textarea 
        value={rejectionReason} 
        onChange={(e) => setRejectionReason(e.target.value)}
        placeholder="Required if rejecting the application"
        className="mt-2"
      />
    </div>
  );
};

export default RejectionReasonInput;
