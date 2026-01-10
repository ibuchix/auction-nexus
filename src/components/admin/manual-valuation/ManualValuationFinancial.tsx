import { AlertTriangle, Download, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ManualValuationData } from "@/hooks/useManualValuation";
import { toast } from "sonner";
import { PLNCurrency } from "@/components/ui/PLNCurrency";

interface ManualValuationFinancialProps {
  valuation: ManualValuationData;
}

export function ManualValuationFinancial({ valuation }: ManualValuationFinancialProps) {
  // Extract finance document with fallback to valuation_result JSON
  const financeDocUrl = valuation.finance_document_url || 
                        valuation.valuation_result?.finance_document_url;
  const financeDocName = valuation.finance_document_name || 
                         valuation.valuation_result?.finance_document_name;
  const financeDocUploadedAt = valuation.finance_document_uploaded_at || 
                               valuation.valuation_result?.finance_document_uploaded_at;
  const serviceHistoryType = valuation.service_history_type || 
                             valuation.valuation_result?.service_history_type;
  
  const handleDownloadDocument = async (fileUrl: string) => {
    try {
      // Finance documents are stored in car-files bucket with public URLs
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error opening document:', error);
      toast.error('Failed to open document');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Seller's Acceptable Price - prominent display */}
      {valuation.seller_acceptable_price != null && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-primary">💰</span>
              Seller's Acceptable Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              <PLNCurrency value={valuation.seller_acceptable_price} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              The minimum price the seller is willing to accept for this vehicle
            </p>
          </CardContent>
        </Card>
      )}
      
      {valuation.has_outstanding_finance && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Outstanding Finance on Vehicle</AlertTitle>
          <AlertDescription>
            This vehicle has outstanding finance of <PLNCurrency value={valuation.finance_amount || 0} />. 
            Finance must be cleared before transfer.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Finance Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Has Outstanding Finance</Label>
              <div className="mt-1">
                {valuation.has_outstanding_finance ? (
                  <Badge variant="destructive">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </div>
            </div>
            
            {valuation.has_outstanding_finance && (
              <div>
                <Label className="text-sm text-muted-foreground">Finance Amount</Label>
                <div className="mt-1 font-semibold">
                  <PLNCurrency value={valuation.finance_amount || 0} />
                </div>
              </div>
            )}
          </div>

          {financeDocName && (
            <div className="border-t pt-4 mt-4">
              <Label className="text-sm font-medium mb-2 block">Finance Document</Label>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{financeDocName}</p>
                    {financeDocUploadedAt && (
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(financeDocUploadedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                {financeDocUrl && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownloadDocument(financeDocUrl)}
                  >
                    <Download className="mr-2 h-3 w-3" />
                    View
                  </Button>
                )}
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Label>Service History Type:</Label>
            <Badge variant={
              serviceHistoryType === 'full' ? 'default' :
              serviceHistoryType === 'partial' ? 'secondary' :
              'outline'
            }>
              {serviceHistoryType || 'None'}
            </Badge>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
