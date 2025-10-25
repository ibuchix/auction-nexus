/**
 * File management utility functions for categorizing and handling
 * images and documents in the car listing system
 */

/**
 * Determine if a file is an image based on MIME type or extension
 */
export function isImageFile(fileType: string, fileName?: string): boolean {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  
  if (imageTypes.includes(fileType.toLowerCase())) return true;
  
  if (fileName) {
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return imageExtensions.includes(ext);
  }
  
  return false;
}

/**
 * Determine if a file is a document (PDF, DOC, etc.)
 */
export function isDocumentFile(fileType: string, fileName?: string): boolean {
  const docTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const docExtensions = ['.pdf', '.doc', '.docx'];
  
  if (docTypes.includes(fileType.toLowerCase())) return true;
  
  if (fileName) {
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return docExtensions.includes(ext);
  }
  
  return false;
}

/**
 * Determine which storage bucket to use based on file type and path
 * Documents always go to 'car-files'
 * Images go to 'car-images' or 'manual-valuation-photos' based on path
 */
export function getStorageBucket(filePath: string, isDocument: boolean): string {
  if (isDocument) {
    return 'car-files';
  }
  
  // Images based on path prefix
  return filePath.startsWith('manual-valuations/')
    ? 'manual-valuation-photos'
    : 'car-images';
}

/**
 * Extract filename from full file path
 */
export function extractFileName(filePath: string): string {
  const parts = filePath.split('/');
  return parts[parts.length - 1];
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(fileType: string): string {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('doc')) return '📝';
  return '📎';
}
