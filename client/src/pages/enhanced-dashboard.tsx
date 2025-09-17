import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/hooks/useNavigation";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import FileUpload from "@/components/file-upload";
import FileTable from "@/components/file-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  Search, 
  CheckCircle, 
  FileText, 
  Share, 
  Wifi, 
  WifiOff, 
  Database, 
  ArrowLeft, 
  Folder,
  HardDrive 
} from "lucide-react";

interface StatsData {
  totalFiles?: number;
  totalFolders?: number;
  totalSize?: number;
  sharedFiles?: number;
  totalCapacity?: number;
  usagePercentage?: number;
}

interface S3StatusData {
  connected?: boolean;
  region?: string;
}

interface S3BucketData {
  buckets: Array<{
    name: string;
    creationDate?: string;
  }>;
}

export default function EnhancedDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { currentLocation, navigateTo, navigateBack } = useNavigation();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const { data: stats, isLoading: statsLoading } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
    retry: false,
  });

  // Query S3 connection status from server
  const { data: s3Status, isLoading: s3StatusLoading } = useQuery<S3StatusData>({
    queryKey: ["/api/s3/status"],
    retry: false,
  });

  // Query S3 buckets when connected
  const { data: s3BucketsData } = useQuery<S3BucketData>({
    queryKey: ["/api/s3/buckets"],
    enabled: !!s3Status?.connected,
    retry: false,
  });

  const isS3Connected = s3Status?.connected || false;
  const s3Buckets = s3BucketsData?.buckets || [];

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
      queryClient.invalidateQueries({ queryKey: ["/api/s3/buckets"] });
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

        {/* Enhanced File Upload Zone */}
        <FileUpload />

        {/* Enhanced File Management */}
        <Card className="mt-8">
          <CardContent className="p-6">
            {/* Virtual Disks Header with Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900">Virtual Disks</h3>
                
                {/* Navigation breadcrumb */}
                {currentLocation.type !== 'root' && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={navigateBack}
                      className="flex items-center space-x-1"
                      data-testid="button-back"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search functionality replacing filters */}
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="Search files and folders..." 
                    className="pl-10 pr-4 py-2 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search"
                  />
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Selected Bucket Display */}
            {isS3Connected && currentLocation.type === 's3-bucket' && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Selected Disks</h4>
                    <p className="text-blue-700">{currentLocation.name}</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 ml-auto">
                    Connected
                  </Badge>
                </div>
              </div>
            )}
            
            {/* S3 Prefix Display */}
            {isS3Connected && currentLocation.type === 's3-prefix' && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Folder className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">S3 Folder: {currentLocation.name}</h4>
                    <p className="text-blue-700">Bucket: {currentLocation.bucketName}</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 ml-auto">
                    S3 Folder
                  </Badge>
                </div>
              </div>
            )}
            
            {/* S3 Buckets Selection (only when at root and connected) */}
            {isS3Connected && currentLocation.type === 'root' && s3Buckets.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Available Disks</h4>
                <div className="space-y-3">
                  {s3Buckets.map((bucket) => (
                    <Card 
                      key={bucket.name}
                      className="cursor-pointer hover:shadow-md transition-shadow border-blue-200 bg-blue-50"
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
                      data-testid={`card-bucket-${bucket.name}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <Database className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-blue-900 truncate">{bucket.name}</p>
                            <p className="text-sm text-blue-600">S3 Bucket</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Only show FileTable when not displaying S3 buckets at root level */}
            {!(isS3Connected && currentLocation.type === 'root' && s3Buckets.length > 0) && (
              <FileTable searchQuery={searchQuery} />
            )}
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
              <RadioGroup
                value={s3Credentials.region}
                onValueChange={(value) => setS3Credentials(prev => ({
                  ...prev,
                  region: value
                }))}
                className="grid grid-cols-1 gap-2"
                data-testid="radio-group-region"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="us-east-1" id="us-east-1" />
                  <Label htmlFor="us-east-1" className="text-sm cursor-pointer">US East (N. Virginia)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="us-west-1" id="us-west-1" />
                  <Label htmlFor="us-west-1" className="text-sm cursor-pointer">US West (N. California)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="us-west-2" id="us-west-2" />
                  <Label htmlFor="us-west-2" className="text-sm cursor-pointer">US West (Oregon)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="eu-west-1" id="eu-west-1" />
                  <Label htmlFor="eu-west-1" className="text-sm cursor-pointer">Europe (Ireland)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="eu-central-1" id="eu-central-1" />
                  <Label htmlFor="eu-central-1" className="text-sm cursor-pointer">Europe (Frankfurt)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ap-southeast-1" id="ap-southeast-1" />
                  <Label htmlFor="ap-southeast-1" className="text-sm cursor-pointer">Asia Pacific (Singapore)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ap-northeast-1" id="ap-northeast-1" />
                  <Label htmlFor="ap-northeast-1" className="text-sm cursor-pointer">Asia Pacific (Tokyo)</Label>
                </div>
              </RadioGroup>
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