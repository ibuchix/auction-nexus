
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProxyBidTable } from "@/components/admin/proxy-bids/ProxyBidTable";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import debounce from "lodash/debounce";

const ProxyBidMonitoring = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");

  // Create a debounced search handler
  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Proxy Bid Monitoring
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Proxy Bid Management</CardTitle>
            <CardDescription>
              View and manage proxy bids across all active auctions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 bg-white/80 backdrop-blur-sm rounded-lg mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by dealer or auction..."
                    className="pl-10"
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                >
                  <option value="updated_at">Last Updated</option>
                  <option value="max_bid_amount">Bid Amount</option>
                  <option value="dealer_name">Dealer Name</option>
                </Select>
              </div>
            </div>

            <ProxyBidTable searchTerm={searchTerm} sortBy={sortBy} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProxyBidMonitoring;
