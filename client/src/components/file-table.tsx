import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ShareModal from "./share-modal";
import { 
  Download, 
  Share, 
  Trash2, 
  FileText, 
  FileImage, 
  File as FileIcon,
  ChevronLeft,
  ChevronRight,
  Folder
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FileData {
  id: number;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  isShared: boolean;
  uploadedAt: string;
  updatedAt: string;
}

export default function FileTable() {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fileData, isLoading } = useQuery<{files: FileData[], folders: any[]}>({
    queryKey: ["/api/files"],
    retry: false,
  });

  const files = fileData?.files || [];
  const folders = fileData?.folders || [];

  const downloadMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await fetch(`/api/files/${fileId}/download`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data.downloadUrl;
    },
    onSuccess: (downloadUrl, fileId) => {
      // Open download URL in new tab
      window.open(downloadUrl, '_blank');
      toast({
        title: "Download Started",
        description: "Your file download has begun",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "File Deleted",
        description: "File has been successfully deleted",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileImage className="h-5 w-5 text-purple-600" />;
    } else if (mimeType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-600" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <FileText className="h-5 w-5 text-green-600" />;
    } else {
      return <FileIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(files.map(file => file.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSelectFile = (fileId: number, checked: boolean) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, fileId]);
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    }
  };

  const handleDownload = (fileId: number) => {
    downloadMutation.mutate(fileId);
  };

  const handleShare = (file: FileData) => {
    setSelectedFile(file);
    setShareModalOpen(true);
  };

  const handleDelete = (fileId: number) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      deleteMutation.mutate(fileId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (files.length === 0 && folders.length === 0) {
    return (
      <div className="text-center py-8">
        <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No files or folders yet</p>
        <p className="text-sm text-gray-400">Upload your first file or create a folder to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedFiles.length === files.length && files.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead>Shared</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Render folders first */}
            {folders.map((folder) => (
              <TableRow key={`folder-${folder.id}`} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox disabled />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <Folder className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{folder.name}</p>
                      <p className="text-sm text-gray-500">Folder</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  -
                </TableCell>
                <TableCell className="text-gray-600">
                  {formatDistanceToNow(new Date(folder.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  {folder.isShared ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Shared
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      Private
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(folder)}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(folder.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {/* Render files */}
            {files.map((file) => (
              <TableRow key={`file-${file.id}`} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox
                    checked={selectedFiles.includes(file.id)}
                    onCheckedChange={(checked) => handleSelectFile(file.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      {getFileIcon(file.mimeType)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">/{file.originalName}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {formatFileSize(file.size)}
                </TableCell>
                <TableCell className="text-gray-600">
                  {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  {file.isShared ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Shared
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      Private
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file.id)}
                      disabled={downloadMutation.isPending}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(file)}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">1</span> to{' '}
          <span className="font-medium">{Math.min(10, files.length)}</span> of{' '}
          <span className="font-medium">{files.length}</span> results
        </p>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="bg-primary text-white">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        file={selectedFile}
      />
    </>
  );
}
