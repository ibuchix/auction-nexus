import { useState } from "react";
import { FileText, Image, Download, Eye, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useDealerDocuments } from "@/hooks/useDealerDocuments";
import { format } from "date-fns";

interface DocumentViewerProps {
  dealerId: string;
}

const DocumentViewer = ({ dealerId }: DocumentViewerProps) => {
  const { documents, isLoading, getSignedUrl } = useDealerDocuments(dealerId);
  const [isOpen, setIsOpen] = useState(true);

  const handleViewDocument = async (filePath: string, fileName: string) => {
    const signedUrl = await getSignedUrl(filePath);
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    }
  };

  const handleDownloadDocument = async (filePath: string, fileName: string) => {
    const signedUrl = await getSignedUrl(filePath);
    if (signedUrl) {
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getDocumentIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500">Documents</h3>
        <div className="animate-pulse bg-gray-200 h-20 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-500">Uploaded Documents</h3>
              {documents.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {documents.length}
                </Badge>
              )}
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-3">
          {documents.length === 0 ? (
            <div className="bg-gray-50 p-3 rounded-md text-center">
              <p className="text-sm text-gray-500">No documents uploaded</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-gray-50 p-3 rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {getDocumentIcon(doc.file_type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.file_name}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {doc.document_type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}
                        </p>
                        {doc.verified && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDocument(doc.file_path, doc.file_name)}
                        className="h-7 w-7 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadDocument(doc.file_path, doc.file_name)}
                        className="h-7 w-7 p-0"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {doc.verification_notes && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600">{doc.verification_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default DocumentViewer;