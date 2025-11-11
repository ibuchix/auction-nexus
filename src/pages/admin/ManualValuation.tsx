import { Car, Eye, RefreshCw, Calculator, Search, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useManualValuation } from "@/hooks/useManualValuation";
import { ManualValuationTable } from "@/components/admin/manual-valuation/ManualValuationTable";
import { ManualValuationDialog } from "@/components/admin/manual-valuation/ManualValuationDialog";
import { ManualValuationStagingDialog } from "@/components/admin/manual-valuation/ManualValuationStagingDialog";
import { exportManualValuationsToCSV } from "@/utils/exportManualValuations";
import { toast } from "sonner";

const ManualValuation = () => {
  const {
    valuations,
    isLoading,
    refetch,
    selectedValuation,
    isDetailsOpen,
    setIsDetailsOpen,
    isStagingOpen,
    setIsStagingOpen,
    reservePrice,
    setReservePrice,
    isTransferring,
    activeStatus,
    setActiveStatus,
    searchTerm,
    setSearchTerm,
    openDetailsDialog,
    handleUpdateValuation,
    handleTransferToCars,
    handleConfirmTransfer,
    handleCancelStaging,
    isUpdating
  } = useManualValuation();

  const handleExport = () => {
    try {
      if (!valuations || valuations.length === 0) {
        toast.error("No data to export");
        return;
      }
      
      exportManualValuationsToCSV(valuations);
      toast.success(`Exported ${valuations.length} valuation${valuations.length === 1 ? '' : 's'}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manual Valuation</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExport} 
            disabled={isLoading || !valuations || valuations.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by vehicle, seller name, VIN, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchTerm && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSearchTerm("")}
          >
            Clear
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" value={activeStatus} onValueChange={setActiveStatus}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="draft" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Draft
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="ready_for_transfer" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Ready
          </TabsTrigger>
        </TabsList>

        {["all", "draft", "pending", "completed", "ready_for_transfer"].map((status) => (
          <TabsContent value={status} key={status}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  {status === "all" ? "All Manual Valuations" : 
                   status === "draft" ? "Draft Valuations" :
                   status === "pending" ? "Pending Valuations" : 
                   status === "completed" ? "Completed Valuations" :
                   "Ready for Transfer"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ManualValuationTable
                  valuations={valuations || []}
                  isLoading={isLoading}
                  onReview={openDetailsDialog}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <ManualValuationDialog
        selectedValuation={selectedValuation}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        reservePrice={reservePrice}
        onReservePriceChange={setReservePrice}
        isTransferring={isTransferring}
        isUpdating={isUpdating}
        onUpdateValuation={handleUpdateValuation}
        onTransferToCars={handleTransferToCars}
      />

      <ManualValuationStagingDialog
        selectedValuation={selectedValuation}
        isOpen={isStagingOpen}
        onOpenChange={setIsStagingOpen}
        reservePrice={reservePrice}
        onReservePriceChange={setReservePrice}
        isTransferring={isTransferring}
        onConfirmTransfer={handleConfirmTransfer}
        onCancel={handleCancelStaging}
      />
    </div>
  );
};

export default ManualValuation;