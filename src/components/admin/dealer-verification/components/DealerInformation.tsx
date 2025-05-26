
import { Building, MapPin, CreditCard, FileText, User } from "lucide-react";
import { DealerData } from "../types";

interface DealerInformationProps {
  dealer: DealerData;
}

const DealerInformation = ({ dealer }: DealerInformationProps) => {
  // Helper function to get property value (handles both camelCase and snake_case)
  const getValue = (camelCase: string, snakeCase: string) => {
    return (dealer as any)[camelCase] || (dealer as any)[snakeCase] || 'N/A';
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500">Dealership Information</h3>
        <div className="mt-2 bg-gray-50 p-3 rounded-md">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            {getValue('dealershipName', 'dealership_name')}
          </p>
          <p className="text-sm mt-1 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {getValue('address', 'address')}
          </p>
          <p className="text-sm mt-1 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Tax ID: {getValue('taxId', 'tax_id')}
          </p>
          <p className="text-sm mt-1 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Business Registry: {getValue('businessRegistryNumber', 'business_registry_number')}
          </p>
          <p className="text-sm mt-1 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            License Number: {getValue('licenseNumber', 'license_number')}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
        <div className="mt-2 bg-gray-50 p-3 rounded-md">
          <p className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            {getValue('supervisorName', 'supervisor_name')}
          </p>
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
