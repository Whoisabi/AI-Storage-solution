import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/hooks/useNavigation";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CloudUpload, File, X, Folder, Plus } from "lucide-react";

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  relativePath?: string; // For folder uploads
}

export default function FileUpload() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentLocation } = useNavigation();
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      let endpoint = '/api/files/upload';
      
      // Add context-specific parameters
      if (currentLocation.type === 'folder' && currentLocation.id) {
        formData.append('folderId', currentLocation.id.toString());
      } else if (currentLocation.type === 's3-bucket' && currentLocation.name) {
        endpoint = '/api/s3/upload';
        formData.append('bucket', currentLocation.name);
        formData.append('prefix', '');
      } else if (currentLocation.type === 's3-prefix' && currentLocation.bucketName) {
        endpoint = '/api/s3/upload';
        formData.append('bucket', currentLocation.bucketName);
        formData.append('prefix', currentLocation.prefix || '');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: (data, file) => {
      setUploadFiles(prev => 
        prev.map(uf => 
          uf.file === file 
            ? { ...uf, status: 'success', progress: 100 }
            : uf
        )
      );
      // Invalidate relevant queries based on current location
      if (currentLocation.type === 's3-bucket') {
        queryClient.invalidateQueries({ queryKey: ['/api/s3/objects', currentLocation.name, ""] });
      } else if (currentLocation.type === 's3-prefix') {
        queryClient.invalidateQueries({ queryKey: ['/api/s3/objects', currentLocation.bucketName, currentLocation.prefix] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/files', currentLocation.type, currentLocation.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: `${file.name} uploaded successfully`,
      });
    },
    onError: (error, file) => {
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

      setUploadFiles(prev => 
        prev.map(uf => 
          uf.file === file 
            ? { ...uf, status: 'error', error: error.message }
            : uf
        )
      );
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newUploadFiles = files.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
      relativePath: file.name,
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);

    // Start uploading files
    files.forEach(file => {
      setUploadFiles(prev => 
        prev.map(uf => 
          uf.file === file 
            ? { ...uf, status: 'uploading', progress: 10 }
            : uf
        )
      );
      uploadMutation.mutate(file);
    });
  }, [uploadMutation]);

  const handleFolderUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newUploadFiles = files.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
      relativePath: (file as any).webkitRelativePath || file.name,
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);

    // Start uploading files
    files.forEach(file => {
      setUploadFiles(prev => 
        prev.map(uf => 
          uf.file === file 
            ? { ...uf, status: 'uploading', progress: 10 }
            : uf
        )
      );
      uploadMutation.mutate(file);
    });
  }, [uploadMutation]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploadFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
      relativePath: (file as any).webkitRelativePath || file.name,
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);

    // Start uploading files
    acceptedFiles.forEach(file => {
      setUploadFiles(prev => 
        prev.map(uf => 
          uf.file === file 
            ? { ...uf, status: 'uploading', progress: 10 }
            : uf
        )
      );
      uploadMutation.mutate(file);
    });
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
    accept: undefined, // Accept all file types
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const removeFile = (fileToRemove: File) => {
    setUploadFiles(prev => prev.filter(uf => uf.file !== fileToRemove));
  };

  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(uf => uf.status === 'uploading' || uf.status === 'pending'));
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upload Files</h3>
          <p className="text-sm text-gray-600 mt-1">
            {currentLocation.type === 'root' ? 'Uploading to: Root directory' :
             currentLocation.type === 'folder' ? `Uploading to: ${currentLocation.name} folder` :
             currentLocation.type === 's3-bucket' ? `Uploading to: ${currentLocation.name} S3 bucket` :
             currentLocation.type === 's3-prefix' ? `Uploading to: ${currentLocation.bucketName}/${currentLocation.prefix}` :
             'Uploading to current location'}
          </p>
        </div>
        
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive || dragActive
              ? 'border-primary bg-blue-50' 
              : 'border-gray-300 hover:border-primary hover:bg-blue-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CloudUpload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive || dragActive ? 'Drop files or folders here' : 'Drop files or folders here, or use the buttons below'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Support for files and folders. Any file types accepted. Maximum file size: 100MB
              </p>
            </div>
            {!(isDragActive || dragActive) && (
              <div className="flex items-center space-x-4">
                {/* Hidden file input for Browse Files */}
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  data-testid="input-file-upload"
                />
                <Button 
                  className="bg-primary hover:bg-blue-700" 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  data-testid="button-upload-files"
                >
                  <File className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
                
                {/* Hidden folder input for Browse Folders */}
                <input
                  type="file"
                  multiple
                  {...({ webkitdirectory: "", directory: "" } as any)}
                  onChange={handleFolderUpload}
                  className="hidden"
                  id="folder-upload"
                  data-testid="input-folder-upload"
                />
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('folder-upload')?.click()}
                  data-testid="button-upload-folder"
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Browse Folders
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Upload Progress */}
        {uploadFiles.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Upload Progress</h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCompleted}
                className="text-xs"
              >
                Clear Completed
              </Button>
            </div>
            
            {uploadFiles.map((uploadFile, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <File className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadFile.file.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress 
                      value={uploadFile.progress} 
                      className="flex-1 h-2"
                    />
                    <span className="text-xs text-gray-500 w-12">
                      {uploadFile.status === 'success' ? '100%' : 
                       uploadFile.status === 'error' ? 'Error' :
                       uploadFile.status === 'uploading' ? `${uploadFile.progress}%` : 'Pending'}
                    </span>
                  </div>
                  {uploadFile.error && (
                    <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(uploadFile.file)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
