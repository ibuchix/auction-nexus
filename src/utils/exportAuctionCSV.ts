import { Auction } from "@/types/auction";
import { format } from "date-fns";

type TabType = "ready" | "active" | "ended" | "notConfigured";

// Escape CSV values that contain commas, quotes, or newlines
function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  
  const stringValue = String(value);
  
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

// Format date consistently
function formatDate(date: string | null | undefined): string {
  if (!date) return "";
  try {
    return format(new Date(date), "yyyy-MM-dd HH:mm:ss");
  } catch {
    return "";
  }
}

// Calculate hours remaining for active auctions
function calculateHoursRemaining(endTime: string | null | undefined): string {
  if (!endTime) return "";
  try {
    const now = new Date();
    const end = new Date(endTime);
    const hours = Math.max(0, Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60)));
    return String(hours);
  } catch {
    return "";
  }
}

// Calculate days since a date
function calculateDaysSince(date: string | null | undefined): string {
  if (!date) return "";
  try {
    const now = new Date();
    const past = new Date(date);
    const days = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60 * 24));
    return String(days);
  } catch {
    return "";
  }
}

// Get common columns for all tabs
function getCommonColumns(): string[] {
  return [
    "ID",
    "Title",
    "Make",
    "Model",
    "Year",
    "VIN",
    "Registration Number",
    "Mileage",
    "Fuel Type",
    "Transmission",
    "Seat Material",
    "Reserve Price",
    "Current Bid",
    "Is Damaged",
    "Number of Keys",
    "Has Service History",
    "Service History Type",
    "Has Full Registration Document",
    "Has Outstanding Finance",
    "Finance Amount",
    "Seller Name",
    "Seller Email",
    "Contact Phone",
    "County",
    "Postcode",
    "Created Date",
  ];
}

// Get tab-specific columns
function getTabSpecificColumns(tabType: TabType): string[] {
  switch (tabType) {
    case "ready":
      return ["Days Since Created", "Image Count", "Status"];
    case "active":
      return [
        "Auction Status",
        "Start Time",
        "End Time",
        "Hours Remaining",
        "Total Bids",
        "Unique Bidders",
        "Highest Bid",
        "Is Manually Controlled",
        "Auction Scheduled",
      ];
    case "ended":
      return [
        "Auction Status",
        "End Time",
        "Final Price",
        "Total Bids",
        "Unique Bidders",
        "Days Since Ended",
      ];
    case "notConfigured":
      return ["Status", "Missing Info"];
    default:
      return [];
  }
}

// Get common values for all tabs
function getCommonValues(auction: Auction): (string | number)[] {
  return [
    auction.id,
    auction.title || "",
    auction.make || "",
    auction.model || "",
    auction.year || "",
    auction.vin || "",
    auction.registration_number || "",
    auction.mileage || "",
    auction.fuel_type || "",
    auction.transmission || "",
    auction.seat_material || "",
    auction.reserve_price || "",
    auction.current_bid || "",
    auction.is_damaged ? "Yes" : "No",
    auction.number_of_keys || "",
    auction.has_service_history ? "Yes" : "No",
    auction.service_history_type || "",
    auction.has_full_registration_document ? "Yes" : "No",
    auction.has_outstanding_finance ? "Yes" : "No",
    auction.finance_amount || "",
    auction.seller_name || "",
    auction.contact_email || "",
    auction.mobile_number || "",
    auction.county || "",
    auction.postcode || "",
    formatDate(auction.created_at),
  ];
}

// Get tab-specific values
function getTabSpecificValues(auction: Auction, tabType: TabType): (string | number)[] {
  switch (tabType) {
    case "ready":
      return [
        calculateDaysSince(auction.created_at),
        auction.images?.length || 0,
        auction.status || "",
      ];
    case "active":
      return [
        auction.auction_status || "",
        formatDate(auction.auction_start_time),
        formatDate(auction.auction_end_time),
        calculateHoursRemaining(auction.auction_end_time),
        auction.auction_metrics?.[0]?.total_bids || 0,
        auction.auction_metrics?.[0]?.unique_bidders || 0,
        auction.current_bid || "",
        auction.is_manually_controlled ? "Yes" : "No",
        auction.auction_scheduled ? "Yes" : "No",
      ];
    case "ended":
      return [
        auction.auction_status || "",
        formatDate(auction.auction_end_time),
        auction.auction_metrics?.[0]?.final_price || auction.current_bid || "",
        auction.auction_metrics?.[0]?.total_bids || 0,
        auction.auction_metrics?.[0]?.unique_bidders || 0,
        calculateDaysSince(auction.auction_end_time),
      ];
    case "notConfigured":
      const missingInfo = [];
      if (!auction.reserve_price) missingInfo.push("Reserve Price");
      if (!auction.images || auction.images.length === 0) missingInfo.push("Images");
      if (!auction.make) missingInfo.push("Make");
      if (!auction.model) missingInfo.push("Model");
      if (!auction.year) missingInfo.push("Year");
      return [
        auction.status || "",
        missingInfo.join("; "),
      ];
    default:
      return [];
  }
}

export function exportAuctionsToCSV(auctions: Auction[], tabType: TabType): void {
  if (auctions.length === 0) {
    throw new Error("No data to export");
  }

  // Build headers
  const commonColumns = getCommonColumns();
  const specificColumns = getTabSpecificColumns(tabType);
  const headers = [...commonColumns, ...specificColumns];

  // Build rows
  const rows = auctions.map(auction => {
    const commonValues = getCommonValues(auction);
    const specificValues = getTabSpecificValues(auction, tabType);
    return [...commonValues, ...specificValues].map(escapeCsvValue);
  });

  // Combine into CSV
  const csvContent = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  // Add UTF-8 BOM for Excel compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  // Generate filename
  const tabName = tabType === "notConfigured" ? "not-configured" : tabType;
  const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
  const filename = `auctions_${tabName}_${timestamp}.csv`;

  // Download file
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
