
import { Building, MapPin, CreditCard, FileText, User, Mail, Phone } from "lucide-react";
import { DealerData } from "../types";

interface DealerInformationProps {
  dealer: DealerData;
}

const DealerInformation = ({ dealer }: DealerInformationProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500">Dealership Information</h3>
        <div className="mt-2 bg-gray-50 p-3 rounded-md">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            {dealer.dealershipName || 'N/A'}
          </p>
          <p className="text-sm mt-1 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {dealer.address || 'N/A'}
          </p>
          <p className="text-sm mt-1 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Tax ID: {dealer.taxId || 'N/A'}
          </p>
          <p className="text-sm mt-1 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Business Registry: {dealer.businessRegistryNumber || 'N/A'}
          </p>
          <p className="text-sm mt-1 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            License Number: {dealer.licenseNumber || 'N/A'}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
        <div className="mt-2 bg-gray-50 p-3 rounded-md">
          <p className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            {dealer.supervisorName || 'N/A'}
          </p>
          {dealer.email && (
            <p className="text-sm mt-1 flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              {dealer.email}
            </p>
          )}
          {dealer.phoneNumber && (
            <button 
              className="text-sm mt-1 flex items-center gap-2 hover:bg-gray-100 p-1 rounded transition-colors w-full text-left"
              onClick={() => window.open(`tel:${dealer.phoneNumber}`, '_self')}
            >
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-blue-600 hover:underline">{dealer.phoneNumber}</span>
            </button>
          )}
        </div>
      </div>

      {dealer.verification_status === 'rejected' && (
        <div>
          <h3 className="text-sm font-medium text-gray-500">Rejection Reason</h3>
          <div className="mt-2 bg-red-50 p-3 rounded-md">
            <p className="text-sm text-red-700">Verification was rejected</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerInformation;
