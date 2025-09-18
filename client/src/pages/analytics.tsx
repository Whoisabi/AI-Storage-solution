import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { 
  HardDrive, 
  Files, 
  Share, 
  RefreshCw,
  TrendingUp,
  Database,
  Clock,
  FileText
} from "lucide-react";
import { useState } from "react";

interface AnalyticsData {
  capacityBytes: number;
  usedBytes: number;
  availableBytes: number;
  usagePct: number;
  counts: {
    files: number;
    folders: number;
    shared: number;
  };
  filesByType: Array<{
    type: string;
    count: number;
    bytes: number;
  }>;
  sizeDistribution: Array<{
    range: string;
    count: number;
    bytes: number;
  }>;
  bucketUsage: Array<{
    bucket: string;
    count: number;
    bytes: number;
  }>;
  topFiles: Array<{
    id: number;
    name: string;
    bytes: number;
    mimeType: string;
  }>;
  recentUploads: Array<{
    id: number;
    name: string;
    bytes: number;
    uploadedAt: string;
  }>;
  partial: boolean;
  refreshedAt: number;
  includeExternal: boolean;
}

export default function Analytics() {
  const { toast } = useToast();
  const [includeExternal, setIncludeExternal] = useState(false);

  const { data: analytics, isLoading, refetch, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", includeExternal],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (includeExternal) params.append('includeExternal', 'true');
      const response = await fetch(`/api/analytics?${params}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    refetchInterval: (query) => document.visibilityState === 'visible' ? 30000 : false,
    refetchOnWindowFocus: true,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = async () => {
    try {
      // Force refresh by adding refresh=true parameter
      const params = new URLSearchParams();
      params.append('refresh', 'true');
      if (includeExternal) params.append('includeExternal', 'true');
      
      const response = await fetch(`/api/analytics?${params}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status} ${response.statusText}`);
      }
      
      await refetch();
      
      toast({
        title: "Analytics Refreshed",
        description: "Latest storage analytics have been loaded",
      });
    } catch (error) {
      console.error('Refresh error:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh analytics data",
        variant: "destructive",
      });
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error ? `Failed to load analytics data: ${error.message}` : 'Failed to load analytics data'}
            </p>
            <Button 
              onClick={handleRefresh} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const storageData = [
    { name: 'Used', value: analytics.usedBytes, color: '#3b82f6' },
    { name: 'Available', value: analytics.availableBytes, color: '#e5e7eb' }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-analytics-title">Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Cloud storage insights and usage statistics</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant={includeExternal ? "default" : "outline"}
                onClick={() => setIncludeExternal(!includeExternal)}
                data-testid="button-toggle-external"
                className={includeExternal 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }
              >
                <Database className="h-4 w-4 mr-2" />
                {includeExternal ? 'Hide External' : 'Include External'}
              </Button>
              <Button 
                onClick={handleRefresh} 
                data-testid="button-refresh-analytics"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Capacity</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-total-capacity">
                      {formatBytes(analytics.capacityBytes)}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <HardDrive className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Used Space</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-used-space">
                      {formatBytes(analytics.usedBytes)}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Files</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-total-files">
                      {analytics.counts.files.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Files className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shared Items</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-shared-items">
                      {analytics.counts.shared}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Share className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Storage Usage Donut Chart */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Storage Usage</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Used vs Available Space</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <div className="relative">
                    <ChartContainer config={{}} className="h-64 w-64">
                      <PieChart>
                        <Pie
                          data={storageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {storageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload[0]) {
                              return (
                                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                                  <p className="font-medium text-gray-900 dark:text-white">{payload[0].name}</p>
                                  <p className="text-blue-600 dark:text-blue-400">{formatBytes(payload[0].value as number)}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ChartContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-usage-percentage">
                          {analytics.usagePct.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Used</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Types Chart */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">File Types Distribution</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Files by type and size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-4">
                  {analytics.filesByType.length > 0 ? (
                    <ChartContainer config={{}} className="h-64">
                      <BarChart data={analytics.filesByType} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis 
                          dataKey="type" 
                          tick={{ fill: 'currentColor' }}
                          className="text-gray-600 dark:text-gray-400"
                        />
                        <YAxis 
                          tick={{ fill: 'currentColor' }}
                          className="text-gray-600 dark:text-gray-400"
                        />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload[0]) {
                              return (
                                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                                  <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                                  <p className="text-blue-600 dark:text-blue-400">Files: {payload[0].payload.count}</p>
                                  <p className="text-green-600 dark:text-green-400">Size: {formatBytes(payload[0].value as number)}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="bytes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                        <p>No files found</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* File Size Distribution */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">File Size Distribution</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Files grouped by size ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <BarChart data={analytics.sizeDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="range" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      tick={{ fill: 'currentColor' }}
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <YAxis 
                      tick={{ fill: 'currentColor' }}
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload[0]) {
                          return (
                            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                              <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                              <p className="text-blue-600 dark:text-blue-400">Files: {payload[0].payload.count}</p>
                              <p className="text-green-600 dark:text-green-400">Total Size: {formatBytes(payload[0].payload.bytes)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Bucket Usage */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">S3 Bucket Usage</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Storage usage by bucket</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.bucketUsage.length > 0 ? (
                  <ChartContainer config={{}} className="h-64">
                    <BarChart data={analytics.bucketUsage} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis 
                        dataKey="bucket"
                        tick={{ fill: 'currentColor' }}
                        className="text-gray-600 dark:text-gray-400"
                      />
                      <YAxis 
                        tick={{ fill: 'currentColor' }}
                        className="text-gray-600 dark:text-gray-400"
                      />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload[0]) {
                            return (
                              <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                                <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                                <p className="text-blue-600 dark:text-blue-400">Files: {payload[0].payload.count}</p>
                                <p className="text-green-600 dark:text-green-400">Size: {formatBytes(payload[0].value as number)}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="bytes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <Database className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                      <p>No S3 buckets with files found</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Files */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Largest Files</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Top 10 files by size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topFiles.length > 0 ? (
                    analytics.topFiles.map((file, index) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg" data-testid={`row-top-file-${index}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white truncate max-w-48">{file.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{file.mimeType}</p>
                          </div>
                        </div>
                        <Badge variant="outline" data-testid={`text-file-size-${index}`} className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                          {formatBytes(file.bytes)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                      <p>No files found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Uploads */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Uploads</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Latest files (last 30 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recentUploads.length > 0 ? (
                    analytics.recentUploads.map((file, index) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg" data-testid={`row-recent-upload-${index}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                            <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white truncate max-w-48">{file.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(file.uploadedAt)}</p>
                          </div>
                        </div>
                        <Badge variant="outline" data-testid={`text-recent-file-size-${index}`} className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                          {formatBytes(file.bytes)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                      <p>No recent uploads</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Info */}
          {analytics.partial && (
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Data is partial due to large bucket sizes. Some external S3 objects may not be included.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date(analytics.refreshedAt).toLocaleString()}
          </div>
        </div>
      </main>
    </div>
  );
}