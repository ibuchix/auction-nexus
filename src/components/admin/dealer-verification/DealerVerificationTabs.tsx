
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { DealerVerificationTable } from "./DealerVerificationTable";
import { DealerData, VerificationStatus } from "./types";

interface DealerVerificationTabsProps {
  activeTab: VerificationStatus | "all";
  setActiveTab: (tab: VerificationStatus | "all") => void;
  dealers: DealerData[] | undefined;
  isProcessing: boolean;
  onToggleVerification: (dealer: DealerData, newStatus: boolean) => Promise<void>;
  onReviewDealer: (dealer: DealerData) => void;
}

export const DealerVerificationTabs = ({
  activeTab,
  setActiveTab,
  dealers,
  isProcessing,
  onToggleVerification,
  onReviewDealer
}: DealerVerificationTabsProps) => {
  return (
    <Tabs defaultValue="pending" value={activeTab} onValueChange={(value) => setActiveTab(value as VerificationStatus | "all")}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          All Dealers
        </TabsTrigger>
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Pending
        </TabsTrigger>
        <TabsTrigger value="approved" className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Approved
        </TabsTrigger>
        <TabsTrigger value="rejected" className="flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          Rejected
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "all" ? "All Dealers" :
               activeTab === "pending" ? "Pending Verifications" : 
               activeTab === "approved" ? "Approved Dealers" : "Rejected Applications"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DealerVerificationTable 
              dealers={dealers}
              isProcessing={isProcessing}
              onToggleVerification={onToggleVerification}
              onReviewDealer={onReviewDealer}
              activeTab={activeTab}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
