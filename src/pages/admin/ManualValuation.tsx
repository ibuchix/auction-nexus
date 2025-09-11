import { Car, Eye, RefreshCw, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useManualValuation } from "@/hooks/useManualValuation";
import { ManualValuationTable } from "@/components/admin/manual-valuation/ManualValuationTable";
import { ManualValuationDialog } from "@/components/admin/manual-valuation/ManualValuationDialog";

const ManualValuation = () => {
  const {
    valuations,
    isLoading,
    refetch,
    selectedValuation,
    isDetailsOpen,
    setIsDetailsOpen,
    reservePrice,
    setReservePrice,
    isTransferring,
    activeStatus,
    setActiveStatus,
    openDetailsDialog,
    handleUpdateValuation,
    handleTransferToCars,
    isUpdating
  } = useManualValuation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manual Valuation</h1>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeStatus} onValueChange={setActiveStatus}>
        <TabsList className="grid w-full grid-cols-4">
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
        </TabsList>

        {["all", "draft", "pending", "completed"].map((status) => (
          <TabsContent value={status} key={status}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  {status === "all" ? "All Manual Valuations" : 
                   status === "draft" ? "Draft Valuations" :
                   status === "pending" ? "Pending Valuations" : 
                   "Completed Valuations"}
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
    </div>
  );
};

export default ManualValuation;