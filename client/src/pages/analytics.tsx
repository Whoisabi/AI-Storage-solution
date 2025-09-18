import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend, LineChart, Line
} from "recharts";
import { 
  HardDrive, 
  Files, 
  FolderOpen, 
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

  const { data: analytics, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", includeExternal],
    queryFn: () => {
      const params = new URLSearchParams();
      if (includeExternal) params.append('includeExternal', 'true');
      return fetch(`/api/analytics?${params}`, { credentials: 'include' }).then(res => res.json());
    },
    refetchInterval: (query) => document.visibilityState === 'visible' ? 10000 : false,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const handleRefresh = () => {
    const params = new URLSearchParams();
    params.append('refresh', 'true');
    if (includeExternal) params.append('includeExternal', 'true');
    
    fetch(`/api/analytics?${params}`, { credentials: 'include' })
      .then(res => res.json())
      .then(() => {
        refetch();
        toast({
          title: "Analytics Refreshed",
          description: "Latest storage analytics have been loaded",
        });
      })
      .catch(error => {
        toast({
          title: "Refresh Failed",
          description: "Failed to refresh analytics data",
          variant: "destructive",
        });
      });
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

  // Color palettes for charts
  const storageColors = ['#3b82f6', '#e5e7eb'];
  const fileTypeColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
  const sizeColors = ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#1d4ed8'];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Failed to load analytics data</p>
            <Button onClick={handleRefresh} className="mt-4">
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

  const radialData = [
    {
      name: 'Storage',
      value: analytics.usagePct,
      fill: analytics.usagePct > 80 ? '#ef4444' : analytics.usagePct > 60 ? '#f59e0b' : '#3b82f6'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-analytics-title">Analytics</h1>
              <p className="text-gray-600 mt-1">Cloud storage insights and usage statistics</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIncludeExternal(!includeExternal)}
                data-testid="button-toggle-external"
              >
                <Database className="h-4 w-4 mr-2" />
                {includeExternal ? 'Hide External' : 'Include External'}
              </Button>
              <Button onClick={handleRefresh} data-testid="button-refresh-analytics">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-total-capacity">
                      {formatBytes(analytics.capacityBytes)}
                    </p>
                  </div>
                  <HardDrive className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Used Space</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-used-space">
                      {formatBytes(analytics.usedBytes)}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Files</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-total-files">
                      {analytics.counts.files.toLocaleString()}
                    </p>
                  </div>
                  <Files className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Shared Items</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-shared-items">
                      {analytics.counts.shared}
                    </p>
                  </div>
                  <Share className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Storage Usage Donut Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
                <CardDescription>Used vs Available Space</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <ChartContainer config={{}} className="h-64 w-64">
                      <PieChart>
                        <Pie
                          data={storageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
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
                                <div className="bg-white p-2 border rounded shadow">
                                  <p className="font-medium">{payload[0].name}</p>
                                  <p className="text-blue-600">{formatBytes(payload[0].value as number)}</p>
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
                        <p className="text-2xl font-bold text-gray-900" data-testid="text-usage-percentage">
                          {analytics.usagePct.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600">Used</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Types Chart */}
            <Card>
              <CardHeader>
                <CardTitle>File Types Distribution</CardTitle>
                <CardDescription>Files by type and size</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <BarChart data={analytics.filesByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload[0]) {
                          return (
                            <div className="bg-white p-3 border rounded shadow">
                              <p className="font-medium">{label}</p>
                              <p className="text-blue-600">Files: {payload[0].payload.count}</p>
                              <p className="text-green-600">Size: {formatBytes(payload[0].value as number)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="bytes" fill="#3b82f6" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* File Size Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>File Size Distribution</CardTitle>
                <CardDescription>Files grouped by size ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <BarChart data={analytics.sizeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload[0]) {
                          return (
                            <div className="bg-white p-3 border rounded shadow">
                              <p className="font-medium">{label}</p>
                              <p className="text-blue-600">Files: {payload[0].payload.count}</p>
                              <p className="text-green-600">Total: {formatBytes(payload[0].value as number)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Bucket Usage */}
            <Card>
              <CardHeader>
                <CardTitle>S3 Bucket Usage</CardTitle>
                <CardDescription>Storage usage by bucket</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.bucketUsage.length > 0 ? (
                  <ChartContainer config={{} } className="h-64">
                    <BarChart data={analytics.bucketUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bucket" />
                      <YAxis />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload[0]) {
                            return (
                              <div className="bg-white p-3 border rounded shadow">
                                <p className="font-medium">{label}</p>
                                <p className="text-blue-600">Files: {payload[0].payload.count}</p>
                                <p className="text-green-600">Size: {formatBytes(payload[0].value as number)}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="bytes" fill="#f59e0b" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
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
            <Card>
              <CardHeader>
                <CardTitle>Largest Files</CardTitle>
                <CardDescription>Top 10 files by size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topFiles.length > 0 ? (
                    analytics.topFiles.map((file, index) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`row-top-file-${index}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-48">{file.name}</p>
                            <p className="text-sm text-gray-500">{file.mimeType}</p>
                          </div>
                        </div>
                        <Badge variant="outline" data-testid={`text-file-size-${index}`}>
                          {formatBytes(file.bytes)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No files found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Uploads */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
                <CardDescription>Latest files (last 30 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recentUploads.length > 0 ? (
                    analytics.recentUploads.map((file, index) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`row-recent-upload-${index}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-48">{file.name}</p>
                            <p className="text-sm text-gray-500">{formatDate(file.uploadedAt)}</p>
                          </div>
                        </div>
                        <Badge variant="outline" data-testid={`text-recent-file-size-${index}`}>
                          {formatBytes(file.bytes)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No recent uploads</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Info */}
          {analytics.partial && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    Data is partial due to large bucket sizes. Some external S3 objects may not be included.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 text-center text-sm text-gray-500">
            Last updated: {new Date(analytics.refreshedAt).toLocaleString()}
          </div>
        </div>
      </main>
    </div>
  );
}