import { useState, useEffect, useRef } from "react";
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

interface FileTableProps {
  searchQuery?: string;
}

export default function FileTable({ searchQuery = '' }: FileTableProps) {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [selectedS3Objects, setSelectedS3Objects] = useState<string[]>([]);
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
    queryKey: ["/api/s3/objects", 
      currentLocation.type === 's3-bucket' ? currentLocation.name : currentLocation.bucketName, 
      currentLocation.prefix || ""],
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

  // Filter items based on search query
  const filteredFiles = files.filter(file => 
    searchQuery === '' || file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFolders = folders.filter(folder => 
    searchQuery === '' || folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredS3Buckets = s3Buckets.filter(bucket => 
    searchQuery === '' || bucket.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredS3Objects = s3Objects.filter(obj => 
    searchQuery === '' || obj.key.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredS3Prefixes = s3Prefixes.filter(prefix => 
    searchQuery === '' || prefix.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    onSuccess: (_, fileId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "File Deleted",
        description: "File has been successfully deleted",
      });
      // Remove the deleted file from selection
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
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

  const deleteS3ObjectMutation = useMutation({
    mutationFn: async ({ bucket, key }: { bucket: string; key: string }) => {
      const response = await fetch('/api/s3/objects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bucket, key }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/s3/objects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "S3 Object Deleted",
        description: "S3 object has been successfully deleted",
      });
      // Only remove the deleted key from selection, preserve other selections
      setSelectedS3Objects(prev => prev.filter(selectedKey => selectedKey !== key));
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

  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      const deleteRequests = [];
      
      // Create wrapped promises that reject on HTTP errors
      for (const fileId of selectedFiles) {
        deleteRequests.push(
          fetch(`/api/files/${fileId}`, {
            method: 'DELETE',
            credentials: 'include',
          }).then(async (response) => {
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`File ${fileId}: ${response.status} ${errorText}`);
            }
            return { type: 'file', id: fileId, success: true };
          })
        );
      }
      
      for (const objectKey of selectedS3Objects) {
        const bucket = currentLocation.bucketName || currentLocation.name;
        deleteRequests.push(
          fetch('/api/s3/objects', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ bucket, key: objectKey }),
          }).then(async (response) => {
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`S3 object ${objectKey}: ${response.status} ${errorText}`);
            }
            return { type: 's3object', key: objectKey, success: true };
          })
        );
      }
      
      const results = await Promise.allSettled(deleteRequests);
      const successes = results.filter(result => result.status === 'fulfilled');
      const failures = results.filter(result => result.status === 'rejected');
      
      // Get successful items for removal from selection
      const successfulFiles: number[] = [];
      const successfulS3Objects: string[] = [];
      
      successes.forEach(result => {
        if (result.status === 'fulfilled') {
          const item = result.value;
          if (item.type === 'file' && 'id' in item) {
            successfulFiles.push(item.id);
          } else if (item.type === 's3object' && 'key' in item) {
            successfulS3Objects.push(item.key);
          }
        }
      });
      
      // If there are failures, include success info in the error for partial handling
      if (failures.length > 0) {
        const errorMessages = failures.map(failure => 
          failure.status === 'rejected' ? failure.reason?.message || 'Unknown error' : ''
        ).join('; ');
        const error = new Error(`${failures.length} of ${results.length} items failed: ${errorMessages}`);
        (error as any).partialSuccess = { successfulFiles, successfulS3Objects, successCount: successes.length, failureCount: failures.length };
        throw error;
      }
      
      return { successfulFiles, successfulS3Objects, successCount: successes.length, failureCount: 0 };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/s3/objects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Items Deleted",
        description: `${result.successCount} items have been successfully deleted`,
      });
      // Remove only successful deletions from selection
      setSelectedFiles(prev => prev.filter(id => !result.successfulFiles.includes(id)));
      setSelectedS3Objects(prev => prev.filter(key => !result.successfulS3Objects.includes(key)));
    },
    onError: (error: any) => {
      // Always invalidate queries even on error to reflect any successful deletions
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/s3/objects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
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
      
      // Handle partial success case
      if (error.partialSuccess) {
        const { successfulFiles, successfulS3Objects, successCount, failureCount } = error.partialSuccess;
        // Remove successful deletions from selection
        setSelectedFiles(prev => prev.filter(id => !successfulFiles.includes(id)));
        setSelectedS3Objects(prev => prev.filter(key => !successfulS3Objects.includes(key)));
        toast({
          title: "Partial Delete Completed",
          description: `${successCount} items deleted successfully, ${failureCount} failed. ${error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Bulk Delete Failed",
          description: error.message,
          variant: "destructive",
        });
      }
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

  // Clear selections when navigating or searching to prevent stale selections
  useEffect(() => {
    setSelectedFiles([]);
    setSelectedS3Objects([]);
  }, [currentLocation.bucketName, currentLocation.name, currentLocation.prefix, searchQuery]);

  const totalSelected = selectedFiles.length + selectedS3Objects.length;
  const totalAvailable = filteredFiles.length + filteredS3Objects.length;
  const isSelectAllChecked = totalAvailable > 0 && totalSelected === totalAvailable;
  const isSelectAllIndeterminate = totalSelected > 0 && totalSelected < totalAvailable;


  const handleSelectAll = (checked: boolean | "indeterminate") => {
    const shouldSelect = Boolean(checked);
    if (shouldSelect) {
      setSelectedFiles(filteredFiles.map(file => file.id));
      setSelectedS3Objects(filteredS3Objects.map(obj => obj.key));
    } else {
      setSelectedFiles([]);
      setSelectedS3Objects([]);
    }
  };

  const handleSelectFile = (fileId: number, checked: boolean | "indeterminate") => {
    const shouldSelect = Boolean(checked);
    if (shouldSelect) {
      setSelectedFiles(prev => [...prev, fileId]);
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    }
  };

  const handleSelectS3Object = (objectKey: string, checked: boolean | "indeterminate") => {
    const shouldSelect = Boolean(checked);
    if (shouldSelect) {
      setSelectedS3Objects(prev => [...prev, objectKey]);
    } else {
      setSelectedS3Objects(prev => prev.filter(key => key !== objectKey));
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

  const handleDeleteS3Object = (objectKey: string) => {
    const bucket = currentLocation.bucketName || currentLocation.name;
    if (window.confirm('Are you sure you want to delete this S3 object?')) {
      deleteS3ObjectMutation.mutate({ bucket: bucket!, key: objectKey });
    }
  };

  const handleBulkDelete = () => {
    const totalSelected = selectedFiles.length + selectedS3Objects.length;
    if (totalSelected === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to delete",
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${totalSelected} selected items?`)) {
      bulkDeleteMutation.mutate();
    }
  };

  if (isLoading || (isS3Connected && s3BucketsLoading) || ((currentLocation.type === 's3-bucket' || currentLocation.type === 's3-prefix') && s3ObjectsLoading)) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (filteredFiles.length === 0 && filteredFolders.length === 0 && filteredS3Buckets.length === 0 && filteredS3Objects.length === 0 && filteredS3Prefixes.length === 0) {
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
      {/* Bulk actions bar */}
      {(selectedFiles.length > 0 || selectedS3Objects.length > 0) && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedFiles.length + selectedS3Objects.length} items selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              data-testid="button-bulk-delete"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isSelectAllIndeterminate ? 'indeterminate' : isSelectAllChecked}
                  onCheckedChange={handleSelectAll}
                  data-testid="checkbox-select-all"
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
            {isS3Connected && currentLocation.type === 'root' && filteredS3Buckets.map((bucket) => (
              <TableRow 
                key={`s3-bucket-${bucket.name}`} 
                className="hover:bg-blue-50 cursor-pointer"
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
                data-testid={`row-bucket-${bucket.name}`}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
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
                <TableCell onClick={(e) => e.stopPropagation()}>
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
            {(currentLocation.type === 's3-bucket' || currentLocation.type === 's3-prefix') && filteredS3Prefixes.map((prefix, index) => (
              <TableRow 
                key={`s3-prefix-${prefix}-${index}`} 
                className="hover:bg-blue-50 cursor-pointer"
                onClick={() => {
                  const newPath = [...currentLocation.path, {
                    type: 's3-prefix',
                    name: prefix.replace(/\/$/, ''),
                    bucketName: currentLocation.bucketName || currentLocation.name,
                    prefix: prefix
                  }];
                  navigateTo({
                    type: 's3-prefix',
                    name: prefix.replace(/\/$/, ''),
                    bucketName: currentLocation.bucketName || currentLocation.name,
                    prefix: prefix,
                    path: newPath
                  });
                }}
                data-testid={`row-s3-folder-${prefix}`}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
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
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newPath = [...currentLocation.path, {
                          type: 's3-prefix',
                          name: prefix.replace(/\/$/, ''),
                          bucketName: currentLocation.bucketName || currentLocation.name,
                          prefix: prefix
                        }];
                        navigateTo({
                          type: 's3-prefix',
                          name: prefix.replace(/\/$/, ''),
                          bucketName: currentLocation.bucketName || currentLocation.name,
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
            {(currentLocation.type === 's3-bucket' || currentLocation.type === 's3-prefix') && filteredS3Objects.map((object, index) => (
              <TableRow key={`s3-object-${object.key}-${index}`} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox
                    checked={selectedS3Objects.includes(object.key)}
                    onCheckedChange={(checked) => handleSelectS3Object(object.key, checked)}
                    data-testid={`checkbox-s3-object-${object.key}`}
                  />
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteS3Object(object.key)}
                      disabled={deleteS3ObjectMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`button-delete-s3-object-${object.key}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {/* Render folders */}
            {filteredFolders.map((folder) => (
              <TableRow 
                key={`folder-${folder.id}`} 
                className="hover:bg-gray-50 cursor-pointer"
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
                data-testid={`row-folder-${folder.id}`}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
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
            {filteredFiles.map((file) => (
              <TableRow key={`file-${file.id}`} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox
                    checked={selectedFiles.includes(file.id)}
                    onCheckedChange={(checked) => handleSelectFile(file.id, checked)}
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
