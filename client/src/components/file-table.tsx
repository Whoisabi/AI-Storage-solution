import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/hooks/useNavigation";
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
  Folder,
  Database
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

interface S3Bucket {
  name: string;
  creationDate?: string;
}

export default function FileTable() {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { navigateTo, currentLocation } = useNavigation();

  const { data: fileData, isLoading } = useQuery<{files: FileData[], folders: any[]}>({
    queryKey: ["/api/files", currentLocation.type, currentLocation.id],
    queryFn: () => {
      const params = new URLSearchParams();
      if (currentLocation.type === 'folder' && currentLocation.id) {
        params.append('folderId', currentLocation.id.toString());
      }
      return fetch(`/api/files?${params}`, { credentials: 'include' }).then(res => res.json());
    },
    enabled: currentLocation.type !== 's3-bucket',
    retry: false,
  });

  // Query S3 connection status
  const { data: s3Status } = useQuery<{connected: boolean, region: string}>({
    queryKey: ["/api/s3/status"],
    retry: false,
  });

  // Query S3 buckets when connected and at root
  const { data: s3BucketsData, isLoading: s3BucketsLoading } = useQuery<{buckets: S3Bucket[]}>({
    queryKey: ["/api/s3/buckets"],
    enabled: !!s3Status?.connected && currentLocation.type === 'root',
    retry: false,
  });

  // Query S3 bucket contents when navigated into a bucket or prefix
  const { data: s3ObjectsData, isLoading: s3ObjectsLoading } = useQuery<{
    objects: {key: string, lastModified?: string, size?: number}[],
    prefixes: string[]
  }>({
    queryKey: ["/api/s3/objects", currentLocation.name, currentLocation.prefix],
    queryFn: () => {
      const params = new URLSearchParams();
      if (currentLocation.type === 's3-bucket') {
        params.append('bucket', currentLocation.name!);
      } else if (currentLocation.type === 's3-prefix') {
        params.append('bucket', currentLocation.bucketName!);
        params.append('prefix', currentLocation.prefix!);
      }
      return fetch(`/api/s3/objects?${params}`, { credentials: 'include' }).then(res => res.json());
    },
    enabled: (currentLocation.type === 's3-bucket' || currentLocation.type === 's3-prefix') && 
             (!!currentLocation.name || !!currentLocation.bucketName),
    retry: false,
  });

  const files = fileData?.files || [];
  const folders = fileData?.folders || [];
  const s3Buckets = s3BucketsData?.buckets || [];
  const s3Objects = s3ObjectsData?.objects || [];
  const s3Prefixes = s3ObjectsData?.prefixes || [];
  const isS3Connected = s3Status?.connected || false;

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

  if (isLoading || (isS3Connected && s3BucketsLoading) || (currentLocation.type === 's3-bucket' && s3ObjectsLoading)) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (files.length === 0 && folders.length === 0 && s3Buckets.length === 0 && s3Objects.length === 0 && s3Prefixes.length === 0) {
    return (
      <div className="text-center py-8">
        <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No files, folders, buckets, or objects found</p>
        <p className="text-sm text-gray-400">Upload files, create folders, or navigate to different locations</p>
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
            {/* Render S3 buckets first (when connected) */}
            {isS3Connected && s3Buckets.map((bucket) => (
              <TableRow key={`s3-bucket-${bucket.name}`} className="hover:bg-blue-50 cursor-pointer">
                <TableCell>
                  <Checkbox disabled />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{bucket.name}</p>
                      <p className="text-sm text-gray-500">S3 Bucket</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  -
                </TableCell>
                <TableCell className="text-gray-600">
                  {bucket.creationDate ? formatDistanceToNow(new Date(bucket.creationDate), { addSuffix: true }) : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    S3 Bucket
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newPath = [...currentLocation.path, {
                          type: 's3-bucket',
                          name: bucket.name
                        }];
                        navigateTo({
                          type: 's3-bucket',
                          name: bucket.name,
                          path: newPath
                        });
                      }}
                      data-testid={`button-open-bucket-${bucket.name}`}
                    >
                      <Folder className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {/* Render S3 prefixes (folders within buckets) */}
            {currentLocation.type === 's3-bucket' && s3Prefixes.map((prefix, index) => (
              <TableRow key={`s3-prefix-${prefix}-${index}`} className="hover:bg-blue-50 cursor-pointer">
                <TableCell>
                  <Checkbox disabled />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <Folder className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{prefix.replace(/\/$/, '')}</p>
                      <p className="text-sm text-gray-500">S3 Folder</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  -
                </TableCell>
                <TableCell className="text-gray-600">
                  -
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    S3 Folder
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newPath = [...currentLocation.path, {
                          type: 's3-prefix',
                          name: prefix.replace(/\/$/, ''),
                          bucketName: currentLocation.name,
                          prefix: prefix
                        }];
                        navigateTo({
                          type: 's3-prefix',
                          name: prefix.replace(/\/$/, ''),
                          bucketName: currentLocation.name,
                          prefix: prefix,
                          path: newPath
                        });
                      }}
                      data-testid={`button-open-s3-folder-${prefix}`}
                    >
                      <Folder className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {/* Render S3 objects (files within buckets) */}
            {currentLocation.type === 's3-bucket' && s3Objects.map((object, index) => (
              <TableRow key={`s3-object-${object.key}-${index}`} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox disabled />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <FileIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{object.key}</p>
                      <p className="text-sm text-gray-500">S3 Object</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {object.size ? `${(object.size / 1024).toFixed(1)} KB` : '-'}
                </TableCell>
                <TableCell className="text-gray-600">
                  {object.lastModified ? formatDistanceToNow(new Date(object.lastModified), { addSuffix: true }) : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-gray-100 text-gray-800">
                    S3 Object
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "S3 Download",
                          description: `Download ${object.key} - coming soon!`,
                        });
                      }}
                      data-testid={`button-download-s3-object-${object.key}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {/* Render folders */}
            {folders.map((folder) => (
              <TableRow key={`folder-${folder.id}`} className="hover:bg-gray-50 cursor-pointer">
                <TableCell>
                  <Checkbox disabled />
                </TableCell>
                <TableCell
                  onClick={() => {
                    const newPath = [...currentLocation.path, {
                      type: 'folder',
                      id: folder.id,
                      name: folder.name
                    }];
                    navigateTo({
                      type: 'folder',
                      id: folder.id,
                      name: folder.name,
                      path: newPath
                    });
                  }}
                >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        const newPath = [...currentLocation.path, {
                          type: 'folder',
                          id: folder.id,
                          name: folder.name
                        }];
                        navigateTo({
                          type: 'folder',
                          id: folder.id,
                          name: folder.name,
                          path: newPath
                        });
                      }}
                      data-testid={`button-open-folder-${folder.id}`}
                    >
                      <Folder className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(folder);
                      }}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(folder.id);
                      }}
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
