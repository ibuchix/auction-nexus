import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Upload, Trash2, Download, ExternalLink, FileText } from "lucide-react";
import type { CarDocument } from "../types";
import { getFileIcon, formatFileSize } from "@/utils/fileManagement";
import { format } from "date-fns";

interface DocumentsTabProps {
  documents: CarDocument[];
  isLoading: boolean;
  isUploading: boolean;
  uploadDocument: (file: File, category: string, fileType: 'document') => Promise<boolean>;
  deleteDocument: (documentId: string, filePath: string, source: 'car' | 'manual') => Promise<boolean>;
}

export function DocumentsTab({ documents, isLoading, isUploading, uploadDocument, deleteDocument }: DocumentsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [deleteDocId, setDeleteDocId] = useState<{ id: string; path: string; source: 'car' | 'manual' } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      await uploadDocument(file, selectedCategory, 'document');
    }

    e.target.value = '';
  };

  const handleDeleteConfirm = async () => {
    if (deleteDocId) {
      await deleteDocument(deleteDocId.id, deleteDocId.path, deleteDocId.source);
      setDeleteDocId(null);
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group documents by category
  const financeDocuments = documents.filter(doc => doc.category === 'finance');
  const serviceHistoryDocuments = documents.filter(doc => doc.category === 'service_history');
  const otherDocuments = documents.filter(doc => doc.category === 'other');

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading documents...</div>;
  }

  const DocumentGroup = ({ title, docs, icon }: { title: string; docs: CarDocument[]; icon: string }) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <span>{icon}</span>
        {title} ({docs.length} {docs.length === 1 ? 'file' : 'files'})
      </h3>
      {docs.length === 0 ? (
        <div className="text-sm text-muted-foreground pl-6">No documents uploaded</div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-3 bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="text-2xl mt-1">{getFileIcon(doc.file_type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded: {format(new Date(doc.uploaded_at), 'MMM d, yyyy \'at\' HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(doc.url, '_blank')}
                    title="View document"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(doc.url, doc.file_name)}
                    title="Download document"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteDocId({ 
                      id: doc.id, 
                      path: doc.file_path,
                      source: doc.source === 'car_file_uploads' ? 'car' : 'manual'
                    })}
                    title="Delete document"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-end gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="flex-1">
            <Label htmlFor="category">Document Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="finance">Finance Document</SelectItem>
                <SelectItem value="service_history">Service History</SelectItem>
                <SelectItem value="other">Other Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button asChild disabled={isUploading}>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Document'}
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No documents uploaded yet</p>
          <p className="text-sm text-muted-foreground mt-1">Upload finance documents, service history, or other files</p>
        </div>
      ) : (
        <div className="space-y-6">
          <DocumentGroup title="Finance Documents" docs={financeDocuments} icon="📑" />
          <DocumentGroup title="Service History Documents" docs={serviceHistoryDocuments} icon="📋" />
          <DocumentGroup title="Other Documents" docs={otherDocuments} icon="📎" />
        </div>
      )}

      <AlertDialog open={!!deleteDocId} onOpenChange={(open) => !open && setDeleteDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The document will be permanently removed from the listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
