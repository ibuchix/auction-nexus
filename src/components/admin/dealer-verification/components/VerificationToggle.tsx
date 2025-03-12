
import { Switch } from "@/components/ui/switch";
import { DealerData } from "../types";

interface VerificationToggleProps {
  dealer: DealerData;
  isProcessing: boolean;
  onToggleVerification: (dealer: DealerData, newStatus: boolean) => Promise<void>;
  setIsReviewOpen: (isOpen: boolean) => void;
}

const VerificationToggle = ({ 
  dealer, 
  isProcessing, 
  onToggleVerification, 
  setIsReviewOpen 
}: VerificationToggleProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500">Quick Verification</h3>
      <div className="mt-2 flex items-center gap-3">
        <Switch 
          checked={dealer.verification_status === 'approved'}
          onCheckedChange={(checked) => {
            onToggleVerification(dealer, checked);
            setIsReviewOpen(false);
          }}
          disabled={isProcessing}
        />
        <span>
          {dealer.verification_status === 'approved' 
            ? 'Verified' 
            : 'Not Verified'}
        </span>
      </div>
    </div>
  );
};

export default VerificationToggle;
