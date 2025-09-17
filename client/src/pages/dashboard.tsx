import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import FileUpload from "@/components/file-upload";
import FileTable from "@/components/file-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, Plus, HardDrive, CheckCircle, FileText, Share, FolderPlus, Wifi, WifiOff } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [s3Credentials, setS3Credentials] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1'
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
  });

  // Query S3 connection status from server
  const { data: s3Status, isLoading: s3StatusLoading } = useQuery({
    queryKey: ["/api/s3/status"],
    retry: false,
  });

  const isS3Connected = s3Status?.connected || false;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // S3 Connection mutation  
  const connectMutation = useMutation({
    mutationFn: async (credentials: typeof s3Credentials) => {
      const response = await fetch('/api/s3/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Connection failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate connection status query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/s3/status"] });
      setShowConnectionModal(false);
      setS3Credentials({ accessKeyId: '', secretAccessKey: '', region: 'us-east-1' });
      toast({
        title: "Connection Successful",
        description: "S3 connection is active",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  });

  const handleS3Connect = () => {
    if (!s3Credentials.accessKeyId || !s3Credentials.secretAccessKey) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both access key and secret key",
        variant: "destructive",
      });
      return;
    }
    connectMutation.mutate(s3Credentials);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600 mt-1">Manage your cloud storage files</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search files..." 
                className="pl-10 pr-4 py-2 w-64"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            </div>
            
            <Button 
              className={`flex items-center space-x-2 ${
                isS3Connected 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-primary hover:bg-blue-700"
              }`}
              onClick={() => setShowConnectionModal(true)}
              data-testid="button-connection"
            >
              {isS3Connected ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span>Connect S3</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Storage Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <HardDrive className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Storage</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : formatFileSize(stats?.totalCapacity || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Used Storage</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : formatFileSize(stats?.totalSize || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.totalFiles || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Share className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shared Files</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.sharedFiles || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* File Upload Zone */}
        <FileUpload />

        {/* File Management */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Files</h3>
              
              <div className="flex items-center space-x-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Files</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="images">Images</SelectItem>
                    <SelectItem value="videos">Videos</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex bg-gray-100 rounded-lg">
                  <Button variant="ghost" size="sm" className="bg-white shadow-sm text-primary">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <HardDrive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <FileTable />
          </CardContent>
        </Card>
      </main>
      
      {/* S3 Connection Modal */}
      <Dialog open={showConnectionModal} onOpenChange={setShowConnectionModal}>
        <DialogContent className="sm:max-w-[425px]" data-testid="modal-s3-connection">
          <DialogHeader>
            <DialogTitle>Connect to S3</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="accessKeyId">Access Key ID</Label>
              <Input
                id="accessKeyId"
                type="text"
                placeholder="Enter your AWS Access Key ID"
                value={s3Credentials.accessKeyId}
                onChange={(e) => setS3Credentials(prev => ({
                  ...prev,
                  accessKeyId: e.target.value
                }))}
                data-testid="input-access-key"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secretAccessKey">Secret Access Key</Label>
              <Input
                id="secretAccessKey"
                type="password"
                placeholder="Enter your AWS Secret Access Key"
                value={s3Credentials.secretAccessKey}
                onChange={(e) => setS3Credentials(prev => ({
                  ...prev,
                  secretAccessKey: e.target.value
                }))}
                data-testid="input-secret-key"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select
                value={s3Credentials.region}
                onValueChange={(value) => setS3Credentials(prev => ({
                  ...prev,
                  region: value
                }))}
              >
                <SelectTrigger data-testid="select-region">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                  <SelectItem value="us-west-1">US West (N. California)</SelectItem>
                  <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                  <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                  <SelectItem value="eu-central-1">Europe (Frankfurt)</SelectItem>
                  <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                  <SelectItem value="ap-northeast-1">Asia Pacific (Tokyo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConnectionModal(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleS3Connect}
              disabled={connectMutation.isPending}
              data-testid="button-connect"
            >
              {connectMutation.isPending ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
