import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/hooks/useNavigation";
import Sidebar from "@/components/sidebar";
import FileUpload from "@/components/file-upload";
import FileTable from "@/components/file-table";
import Breadcrumb from "@/components/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Folder, File } from "lucide-react";

export default function MyFiles() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { currentLocation } = useNavigation();

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
            <h2 className="text-3xl font-bold text-gray-900">
              {currentLocation.name || 'My Files'}
            </h2>
            <p className="text-gray-600 mt-1">Browse and manage your files</p>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <Breadcrumb />

        {/* File Upload Zone */}
        <FileUpload />

        {/* File Management */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentLocation.type === 'root' ? 'All Files' : 
                 currentLocation.type === 's3-bucket' ? 'Bucket Contents' : 
                 'Folder Contents'}
              </h3>
            </div>
            
            <FileTable />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}