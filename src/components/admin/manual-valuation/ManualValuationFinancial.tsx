import { AlertTriangle, Download, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ManualValuationData } from "@/hooks/useManualValuation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PLNCurrency } from "@/components/ui/PLNCurrency";

interface ManualValuationFinancialProps {
  valuation: ManualValuationData;
}

export function ManualValuationFinancial({ valuation }: ManualValuationFinancialProps) {
  
  const handleDownloadDocument = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('manual-valuation-photos')
        .createSignedUrl(filePath, 3600);

      if (error) throw error;
      
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  return (
    <div className="space-y-6">
      
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

          {valuation.finance_document_name && (
            <div className="border-t pt-4 mt-4">
              <Label className="text-sm font-medium mb-2 block">Finance Document</Label>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{valuation.finance_document_name}</p>
                    {valuation.finance_document_uploaded_at && (
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(valuation.finance_document_uploaded_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                {valuation.finance_document_url && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownloadDocument(valuation.finance_document_url!)}
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
              valuation.service_history_type === 'full' ? 'default' :
              valuation.service_history_type === 'partial' ? 'secondary' :
              'outline'
            }>
              {valuation.service_history_type || 'None'}
            </Badge>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
