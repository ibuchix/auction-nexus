import { format } from "date-fns";

interface Seller {
  id: string;
  role: string;
  created_at: string;
  name: string | null;
  email: string | null;
  mobile_number: string | null;
  address: string | null;
  verification_status: string | null;
  is_verified: boolean;
  total_listings: number;
  active_listings: number;
}

export function exportSellersToCSV(sellers: Seller[], exportType: 'emails_only' | 'full' = 'emails_only') {
  if (!sellers || sellers.length === 0) {
    throw new Error("No sellers to export");
  }

  // CSV escape function
  const escapeCSVValue = (value: any): string => {
    const stringValue = String(value ?? "");
    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  let headers: string[];
  let rows: string[][];

  if (exportType === 'emails_only') {
    // Simple email-only export
    headers = ["Email"];
    rows = sellers
      .filter(seller => seller.email)
      .map(seller => [seller.email!]);
  } else {
    // Full seller data export
    headers = [
      "Seller ID",
      "Name",
      "Email",
      "Phone",
      "Address",
      "Status",
      "Verified",
      "Active Listings",
      "Total Listings",
      "Joined Date"
    ];
    rows = sellers.map(seller => [
      seller.id,
      seller.name || "N/A",
      seller.email || "N/A",
      seller.mobile_number || "N/A",
      seller.address || "N/A",
      seller.verification_status || "N/A",
      seller.is_verified ? "Yes" : "No",
      String(seller.active_listings || 0),
      String(seller.total_listings || 0),
      seller.created_at ? format(new Date(seller.created_at), "MMM dd, yyyy h:mm a") : "N/A"
    ]);
  }

  // Build CSV content with UTF-8 BOM for Excel compatibility
  const BOM = "\uFEFF";
  const csvContent = BOM + [
    headers.map(escapeCSVValue).join(","),
    ...rows.map(row => row.map(escapeCSVValue).join(","))
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  const typeLabel = exportType === 'emails_only' ? 'emails' : 'full';
  const filename = `sellers-${typeLabel}-${format(new Date(), "yyyyMMdd-HHmmss")}.csv`;
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
