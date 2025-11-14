import { DealerData } from "@/components/admin/dealer-verification/types";
import { format } from "date-fns";

export function exportDealerVerificationsToCSV(dealers: DealerData[], status?: string) {
  if (!dealers || dealers.length === 0) {
    throw new Error("No dealers to export");
  }

  // Define CSV headers
  const headers = [
    "Dealer ID",
    "User ID",
    "Dealership Name",
    "Contact Person",
    "Email",
    "Phone",
    "Address",
    "Tax ID",
    "Business Registry",
    "License Number",
    "Status",
    "Verified",
    "Created Date",
    "Updated Date",
  ];

  // Convert data to CSV rows
  const rows = dealers.map((dealer) => {
    return [
      dealer.id || "N/A",
      dealer.userId || "N/A",
      dealer.dealershipName || "N/A",
      dealer.supervisorName || "N/A",
      dealer.email || "N/A",
      dealer.phoneNumber || "N/A",
      dealer.address || "N/A",
      dealer.taxId || "N/A",
      dealer.businessRegistryNumber || "N/A",
      dealer.licenseNumber || "N/A",
      dealer.verification_status || "N/A",
      dealer.isVerified ? "Yes" : "No",
      dealer.createdAt ? format(new Date(dealer.createdAt), "MMM dd, yyyy h:mm a") : "N/A",
      dealer.updatedAt ? format(new Date(dealer.updatedAt), "MMM dd, yyyy h:mm a") : "N/A",
    ];
  });

  // Escape and format CSV data
  const escapeCSVValue = (value: any): string => {
    const stringValue = String(value);
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Build CSV content
  const csvContent = [
    headers.map(escapeCSVValue).join(","),
    ...rows.map((row) => row.map(escapeCSVValue).join(","))
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  const statusLabel = status && status !== "all" ? `-${status}` : "";
  const filename = `dealer-verifications${statusLabel}-${format(new Date(), "yyyyMMdd-HHmmss")}.csv`;
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
