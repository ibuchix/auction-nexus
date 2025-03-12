
import { Textarea } from "@/components/ui/textarea";
import { VerificationStatus } from "../types";

interface AdminNotesInputProps {
  adminNotes: string;
  setAdminNotes: (notes: string) => void;
  verificationStatus: VerificationStatus;
}

const AdminNotesInput = ({ 
  adminNotes, 
  setAdminNotes, 
  verificationStatus 
}: AdminNotesInputProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500">Admin Notes</h3>
      <Textarea 
        value={adminNotes} 
        onChange={(e) => setAdminNotes(e.target.value)}
        placeholder="Add notes about this verification"
        className="mt-2"
        disabled={verificationStatus !== 'pending'}
      />
    </div>
  );
};

export default AdminNotesInput;
