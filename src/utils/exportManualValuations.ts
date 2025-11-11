import { ManualValuationData } from "@/hooks/useManualValuation";
import { format } from "date-fns";

export function exportManualValuationsToCSV(valuations: ManualValuationData[], filename?: string) {
  if (!valuations || valuations.length === 0) {
    throw new Error("No data to export");
  }

  // Define CSV headers
  const headers = [
    "ID",
    "Status",
    "Make",
    "Model",
    "Year",
    "VIN",
    "Registration Number",
    "Transmission",
    "Fuel Type",
    "Mileage",
    "Reserve Price",
    "Seller Name",
    "Contact Email",
    "Contact Phone",
    "Mobile Number",
    "Street Address",
    "Town",
    "County",
    "Postcode",
    "Number of Keys",
    "Seat Material",
    "Service History Type",
    "Is Damaged",
    "Is Registered in Poland",
    "Is Selling on Behalf",
    "Has Full Registration Document",
    "Has Outstanding Finance",
    "Finance Amount",
    "Has Tool Pack",
    "Has Documentation",
    "Seller Notes",
    "Admin Notes",
    "Image Count",
    "Submitted Date",
  ];

  // Convert data to CSV rows
  const rows = valuations.map((valuation) => {
    return [
      valuation.id,
      valuation.status || "N/A",
      valuation.make || "N/A",
      valuation.model || "N/A",
      valuation.year || "N/A",
      valuation.vin || "N/A",
      valuation.registration_number || "N/A",
      valuation.transmission || "N/A",
      valuation.fuel_type || "N/A",
      valuation.mileage || "N/A",
      valuation.reserve_price || "N/A",
      valuation.name || "N/A",
      valuation.contact_email || "N/A",
      valuation.contact_phone || "N/A",
      valuation.mobile_number || "N/A",
      valuation.street_address || "N/A",
      valuation.town || "N/A",
      valuation.county || "N/A",
      valuation.postcode || "N/A",
      valuation.number_of_keys || "N/A",
      valuation.seat_material || "N/A",
      valuation.service_history_type || "N/A",
      valuation.is_damaged ? "Yes" : "No",
      valuation.is_registered_in_poland ? "Yes" : "No",
      valuation.is_selling_on_behalf ? "Yes" : "No",
      valuation.has_full_registration_document ? "Yes" : "No",
      valuation.has_outstanding_finance ? "Yes" : "No",
      valuation.finance_amount || "N/A",
      valuation.has_tool_pack ? "Yes" : "No",
      valuation.has_documentation ? "Yes" : "No",
      valuation.seller_notes || "N/A",
      valuation.notes || "N/A",
      valuation.images?.length || 0,
      valuation.created_at ? format(new Date(valuation.created_at), "yyyy-MM-dd HH:mm:ss") : "N/A",
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
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename || `manual-valuations-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
