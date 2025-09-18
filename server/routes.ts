import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { s3Service } from "./services/s3Service";
import { 
  storeS3CredentialsInSession, 
  getS3CredentialsFromSession, 
  clearS3CredentialsFromSession, 
  hasS3CredentialsInSession 
} from "./services/sessionCredentials";
import multer from "multer";
import { insertFileSchema, shareFileSchema, insertFolderSchema, shareFolderSchema } from "@shared/schema";
import { nanoid } from "nanoid";
import { ZodError } from "zod";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Docker
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // File upload endpoint
  app.post('/api/files/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.id;
      const { buffer, originalname, mimetype, size } = req.file;
      const folderId = req.body.folderId ? parseInt(req.body.folderId) : undefined;

      // Upload to S3
      const uploadResult = await s3Service.uploadFile(
        buffer,
        originalname,
        mimetype,
        userId
      );

      // Save file metadata to database
      const fileData = insertFileSchema.parse({
        userId,
        folderId,
        name: originalname,
        originalName: originalname,
        mimeType: mimetype,
        size,
        s3Key: uploadResult.key,
        s3Bucket: uploadResult.bucket,
      });

      const file = await storage.createFile(fileData);

      res.json({
        success: true,
        file: {
          ...file,
          url: uploadResult.location,
        },
      });
    } catch (error) {
      console.error("File upload error:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid file data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Get user files and folders
  app.get('/api/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const folderId = req.query.folderId ? parseInt(req.query.folderId as string) : undefined;
      const files = await storage.getFilesByUserId(userId, folderId);
      const folders = await storage.getFoldersByUserId(userId, folderId);
      res.json({ files, folders });
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Create folder
  app.post('/api/folders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const folderData = insertFolderSchema.parse({
        ...req.body,
        userId,
      });

      const folder = await storage.createFolder(folderData);
      res.json({ success: true, folder });
    } catch (error) {
      console.error("Folder creation error:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid folder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  // Share folder
  app.post('/api/folders/:id/share', isAuthenticated, async (req: any, res) => {
    try {
      const folderId = parseInt(req.params.id);
      const userId = req.user.id;
      const { isShared } = shareFolderSchema.parse(req.body);
      
      const folder = await storage.getFolderById(folderId);
      if (!folder || folder.userId !== userId) {
        return res.status(404).json({ message: "Folder not found" });
      }

      const shareToken = isShared ? nanoid() : undefined;
      const updatedFolder = await storage.updateFolderSharing(folderId, isShared, shareToken);

      let shareUrl = undefined;
      if (isShared && shareToken) {
        const baseUrl = req.protocol + '://' + req.get('host');
        shareUrl = `${baseUrl}/api/shared/folder/${shareToken}`;
      }

      res.json({
        success: true,
        folder: updatedFolder,
        shareUrl,
      });
    } catch (error) {
      console.error("Error sharing folder:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid share data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to share folder" });
    }
  });

  // Delete folder
  app.delete('/api/folders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const folderId = parseInt(req.params.id);
      const userId = req.user.id;
      
      const folder = await storage.getFolderById(folderId);
      if (!folder || folder.userId !== userId) {
        return res.status(404).json({ message: "Folder not found" });
      }

      await storage.deleteFolder(folderId);
      res.json({ success: true, message: "Folder deleted successfully" });
    } catch (error) {
      console.error("Error deleting folder:", error);
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });

  // Download file
  app.get('/api/files/:id/download', isAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = req.user.id;
      
      const file = await storage.getFileById(fileId);
      if (!file || file.userId !== userId) {
        return res.status(404).json({ message: "File not found" });
      }

      const downloadUrl = await s3Service.getFileUrl(file.s3Key);
      res.json({ downloadUrl });
    } catch (error) {
      console.error("Error generating download URL:", error);
      res.status(500).json({ message: "Failed to generate download URL" });
    }
  });

  // Share file
  app.post('/api/files/:id/share', isAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = req.user.id;
      const { isShared } = shareFileSchema.parse(req.body);
      
      const file = await storage.getFileById(fileId);
      if (!file || file.userId !== userId) {
        return res.status(404).json({ message: "File not found" });
      }

      const shareToken = isShared ? nanoid() : undefined;
      const updatedFile = await storage.updateFileSharing(fileId, isShared, shareToken);

      let shareUrl = undefined;
      if (isShared && shareToken) {
        const baseUrl = req.protocol + '://' + req.get('host');
        shareUrl = `${baseUrl}/api/shared/file/${shareToken}`;
      }

      res.json({
        success: true,
        file: updatedFile,
        shareUrl,
      });
    } catch (error) {
      console.error("Error sharing file:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid share data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to share file" });
    }
  });

  // Access shared file
  app.get('/api/shared/file/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const file = await storage.getSharedFile(token);
      
      if (!file || !file.isShared) {
        return res.status(404).json({ message: "Shared file not found" });
      }

      const downloadUrl = await s3Service.getFileUrl(file.s3Key, 300); // 5 minutes
      res.json({
        file: {
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
          uploadedAt: file.uploadedAt,
        },
        downloadUrl,
      });
    } catch (error) {
      console.error("Error accessing shared file:", error);
      res.status(500).json({ message: "Failed to access shared file" });
    }
  });

  // Access shared folder
  app.get('/api/shared/folder/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const folder = await storage.getSharedFolder(token);
      
      if (!folder || !folder.isShared) {
        return res.status(404).json({ message: "Shared folder not found" });
      }

      const files = await storage.getFilesByUserId(folder.userId, folder.id);
      const subfolders = await storage.getFoldersByUserId(folder.userId, folder.id);

      res.json({
        folder: {
          name: folder.name,
          createdAt: folder.createdAt,
        },
        files,
        subfolders,
      });
    } catch (error) {
      console.error("Error accessing shared folder:", error);
      res.status(500).json({ message: "Failed to access shared folder" });
    }
  });

  // Delete file
  app.delete('/api/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = req.user.id;
      
      const file = await storage.getFileById(fileId);
      if (!file || file.userId !== userId) {
        return res.status(404).json({ message: "File not found" });
      }

      // Delete from S3
      await s3Service.deleteFile(file.s3Key);

      // Delete from database
      await storage.deleteFile(fileId);

      res.json({ success: true, message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Get storage statistics
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const files = await storage.getFilesByUserId(userId);
      const folders = await storage.getFoldersByUserId(userId);
      
      // Count S3 objects if connected
      let s3ObjectCount = 0;
      let s3TotalSize = 0;
      const credentials = getS3CredentialsFromSession(userId);
      
      if (credentials && hasS3CredentialsInSession(userId)) {
        try {
          const buckets = await s3Service.listBuckets(credentials);
          for (const bucket of buckets) {
            // Paginate through all objects in the bucket
            let continuationToken: string | undefined = undefined;
            let hasMore = true;
            
            while (hasMore) {
              const objects = await s3Service.listObjects(bucket.name, '', credentials, continuationToken, 1000);
              s3ObjectCount += objects.objects.length;
              s3TotalSize += objects.objects.reduce((sum, obj) => sum + (obj.size || 0), 0);
              
              continuationToken = objects.nextToken;
              hasMore = objects.isTruncated && !!continuationToken;
              
              // Safety limit to prevent infinite loops
              if (s3ObjectCount > 100000) {
                console.warn(`S3 stats: Hit safety limit of 100k objects for user ${userId}`);
                break;
              }
            }
          }
        } catch (s3Error) {
          console.warn("Error fetching S3 stats:", s3Error);
          // Continue without S3 stats if there's an error
        }
      }
      
      const totalFiles = files.length + s3ObjectCount;
      const totalFolders = folders.length;
      const totalSize = files.reduce((sum, file) => sum + file.size, 0) + s3TotalSize;
      const sharedFiles = files.filter(file => file.isShared).length;
      const sharedFolders = folders.filter(folder => folder.isShared).length;
      
      // Mock total storage capacity (1TB)
      const totalCapacity = 1024 * 1024 * 1024 * 1024; // 1TB in bytes

      res.json({
        totalFiles,
        totalFolders,
        totalSize,
        sharedFiles: sharedFiles + sharedFolders,
        totalCapacity,
        usagePercentage: (totalSize / totalCapacity) * 100,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Analytics cache - in-memory per user with TTL
  const analyticsCache = new Map<string, { data: any; timestamp: number }>();
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  // Analytics endpoint with comprehensive storage insights
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const refresh = req.query.refresh === 'true';
      const includeExternal = req.query.includeExternal === 'true';
      
      // Check cache first
      const cached = analyticsCache.get(userId);
      if (!refresh && cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return res.json(cached.data);
      }

      const files = await storage.getFilesByUserId(userId);
      const folders = await storage.getFoldersByUserId(userId);
      
      // Base calculations from app-managed files
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const sharedFiles = files.filter(file => file.isShared).length;
      const sharedFolders = folders.filter(folder => folder.isShared).length;
      
      // File type analysis
      const filesByTypeMap = files.reduce((acc, file) => {
        let type = 'Other';
        if (file.mimeType) {
          if (file.mimeType.startsWith('image/')) type = 'Images';
          else if (file.mimeType.startsWith('video/')) type = 'Videos';
          else if (file.mimeType.startsWith('audio/')) type = 'Audio';
          else if (file.mimeType.includes('pdf')) type = 'PDFs';
          else if (file.mimeType.includes('text/') || file.mimeType.includes('doc')) type = 'Documents';
          else if (file.mimeType.includes('zip') || file.mimeType.includes('rar') || file.mimeType.includes('7z')) type = 'Archives';
        }
        
        if (!acc[type]) acc[type] = { count: 0, bytes: 0 };
        acc[type].count++;
        acc[type].bytes += file.size;
        return acc;
      }, {} as Record<string, { count: number; bytes: number }>);

      // Size distribution analysis
      const sizeRanges = [
        { min: 0, max: 10 * 1024, label: '0-10 KB' },
        { min: 10 * 1024, max: 1024 * 1024, label: '10 KB - 1 MB' },
        { min: 1024 * 1024, max: 100 * 1024 * 1024, label: '1-100 MB' },
        { min: 100 * 1024 * 1024, max: 1024 * 1024 * 1024, label: '100 MB - 1 GB' },
        { min: 1024 * 1024 * 1024, max: Infinity, label: '> 1 GB' }
      ];

      const sizeDistribution = sizeRanges.map(range => {
        const filesInRange = files.filter(file => file.size >= range.min && file.size < range.max);
        return {
          range: range.label,
          count: filesInRange.length,
          bytes: filesInRange.reduce((sum, file) => sum + file.size, 0)
        };
      });

      // Bucket usage analysis
      const bucketUsageMap = files.reduce((acc, file) => {
        const bucket = file.s3Bucket || 'Unknown';
        if (!acc[bucket]) acc[bucket] = { count: 0, bytes: 0 };
        acc[bucket].count++;
        acc[bucket].bytes += file.size;
        return acc;
      }, {} as Record<string, { count: number; bytes: number }>);

      // Top largest files
      const topFiles = files
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .map(file => ({
          id: file.id,
          name: file.name,
          bytes: file.size,
          mimeType: file.mimeType
        }));

      // Recent uploads (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentUploads = files
        .filter(file => file.uploadedAt && new Date(file.uploadedAt) > thirtyDaysAgo)
        .sort((a, b) => {
          const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
          const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 10)
        .map(file => ({
          id: file.id,
          name: file.name,
          bytes: file.size,
          uploadedAt: file.uploadedAt
        }));

      // S3 external objects (if requested and credentials available)
      let s3ObjectCount = 0;
      let s3TotalSize = 0;
      let isPartial = false;
      const credentials = getS3CredentialsFromSession(userId);

      if (includeExternal && credentials && hasS3CredentialsInSession(userId)) {
        try {
          const buckets = await s3Service.listBuckets(credentials);
          for (const bucket of buckets) {
            let continuationToken: string | undefined = undefined;
            let hasMore = true;
            
            while (hasMore) {
              const objects = await s3Service.listObjects(bucket.name, '', credentials, continuationToken, 1000);
              s3ObjectCount += objects.objects.length;
              s3TotalSize += objects.objects.reduce((sum, obj) => sum + (obj.size || 0), 0);
              
              // Add S3 objects to bucket usage
              if (!bucketUsageMap[bucket.name]) {
                bucketUsageMap[bucket.name] = { count: 0, bytes: 0 };
              }
              bucketUsageMap[bucket.name].count += objects.objects.length;
              bucketUsageMap[bucket.name].bytes += objects.objects.reduce((sum, obj) => sum + (obj.size || 0), 0);
              
              // Add S3 objects to file types (infer from extension)
              objects.objects.forEach(obj => {
                let type = 'Other';
                if (obj.key) {
                  const ext = obj.key.split('.').pop()?.toLowerCase();
                  if (ext && ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) type = 'Images';
                  else if (ext && ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) type = 'Videos';
                  else if (ext && ['mp3', 'wav', 'flac', 'aac'].includes(ext)) type = 'Audio';
                  else if (ext && ['pdf'].includes(ext)) type = 'PDFs';
                  else if (ext && ['doc', 'docx', 'txt', 'rtf'].includes(ext)) type = 'Documents';
                  else if (ext && ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) type = 'Archives';
                }
                
                if (!filesByTypeMap[type]) filesByTypeMap[type] = { count: 0, bytes: 0 };
                filesByTypeMap[type].count++;
                filesByTypeMap[type].bytes += obj.size || 0;
              });
              
              continuationToken = objects.nextToken;
              hasMore = objects.isTruncated && !!continuationToken;
              
              // Safety limit to prevent infinite loops
              if (s3ObjectCount > 50000) {
                console.warn(`S3 analytics: Hit safety limit of 50k objects for user ${userId}`);
                isPartial = true;
                break;
              }
            }
            
            if (isPartial) break;
          }
        } catch (s3Error) {
          console.warn("Error fetching S3 external stats:", s3Error);
          isPartial = true;
        }
      }

      // Storage capacity calculation (1TB mock + actual S3 usage)
      const baseCapacity = 1024 * 1024 * 1024 * 1024; // 1TB
      const totalUsed = totalSize + s3TotalSize;
      const totalCapacity = baseCapacity;
      const usagePercentage = (totalUsed / totalCapacity) * 100;

      const analyticsData = {
        // Capacity metrics
        capacityBytes: totalCapacity,
        usedBytes: totalUsed,
        availableBytes: totalCapacity - totalUsed,
        usagePct: usagePercentage,
        
        // Count metrics
        counts: {
          files: files.length + s3ObjectCount,
          folders: folders.length,
          shared: sharedFiles + sharedFolders
        },
        
        // Distribution data for charts
        filesByType: Object.entries(filesByTypeMap).map(([type, data]) => ({
          type,
          count: data.count,
          bytes: data.bytes
        })),
        
        sizeDistribution,
        
        bucketUsage: Object.entries(bucketUsageMap).map(([bucket, data]) => ({
          bucket,
          count: data.count,
          bytes: data.bytes
        })),
        
        // Top content
        topFiles,
        recentUploads,
        
        // Metadata
        partial: isPartial,
        refreshedAt: Date.now(),
        includeExternal
      };

      // Cache the result
      analyticsCache.set(userId, { data: analyticsData, timestamp: Date.now() });
      
      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // S3 Connection Management Endpoints
  
  // Connect to user's AWS account
  app.post('/api/s3/connect', isAuthenticated, async (req: any, res) => {
    try {
      const { accessKeyId, secretAccessKey, region, sessionToken } = req.body;
      
      if (!accessKeyId || !secretAccessKey) {
        return res.status(400).json({ message: "Access Key ID and Secret Access Key are required" });
      }

      const credentials = {
        accessKeyId,
        secretAccessKey,
        region: region || 'us-east-1',
        ...(sessionToken && { sessionToken })
      };

      // Validate credentials by attempting to list buckets
      const buckets = await s3Service.validateCredentials(credentials);
      
      // Store credentials in session
      const userId = req.user.id;
      storeS3CredentialsInSession(userId, credentials);
      
      res.json({ 
        success: true, 
        message: "Successfully connected to AWS S3",
        buckets 
      });
    } catch (error: any) {
      console.error("S3 connection error:", error);
      res.status(400).json({ 
        message: "Failed to connect to AWS S3", 
        error: error.message 
      });
    }
  });

  // Disconnect from user's AWS account
  app.post('/api/s3/disconnect', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      clearS3CredentialsFromSession(userId);
      res.json({ 
        success: true, 
        message: "Disconnected from AWS S3" 
      });
    } catch (error) {
      console.error("S3 disconnect error:", error);
      res.status(500).json({ message: "Failed to disconnect from AWS S3" });
    }
  });

  // List S3 buckets
  app.get('/api/s3/buckets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const credentials = getS3CredentialsFromSession(userId);
      
      if (!credentials) {
        return res.status(400).json({ message: "No AWS credentials found. Please connect first." });
      }

      const buckets = await s3Service.listBuckets(credentials);
      res.json({ buckets });
    } catch (error: any) {
      console.error("Error listing buckets:", error);
      res.status(500).json({ 
        message: "Failed to list buckets", 
        error: error.message 
      });
    }
  });

  // List objects in a bucket
  app.get('/api/s3/objects', isAuthenticated, async (req: any, res) => {
    try {
      const { bucket, prefix = '', token } = req.query;
      const userId = req.user.id;
      const credentials = getS3CredentialsFromSession(userId);
      
      if (!credentials) {
        return res.status(400).json({ message: "No AWS credentials found. Please connect first." });
      }

      if (!bucket) {
        return res.status(400).json({ message: "Bucket name is required" });
      }

      const result = await s3Service.listObjects(
        bucket as string,
        prefix as string,
        credentials,
        token as string | undefined
      );
      
      res.json(result);
    } catch (error: any) {
      console.error("Error listing objects:", error);
      res.status(500).json({ 
        message: "Failed to list objects", 
        error: error.message 
      });
    }
  });

  // Upload file to S3 bucket
  app.post('/api/s3/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { bucket, prefix = '' } = req.body;
      const userId = req.user.id;
      const credentials = getS3CredentialsFromSession(userId);
      
      if (!credentials) {
        return res.status(400).json({ message: "No AWS credentials found. Please connect first." });
      }

      if (!bucket) {
        return res.status(400).json({ message: "Bucket name is required" });
      }

      const { buffer, originalname, mimetype } = req.file;
      
      // Create the full S3 key with prefix
      const key = prefix ? `${prefix}/${originalname}` : originalname;
      
      const uploadResult = await s3Service.uploadToS3(
        buffer,
        bucket,
        key,
        mimetype,
        credentials
      );

      res.json({
        success: true,
        message: "File uploaded successfully",
        result: uploadResult
      });
    } catch (error: any) {
      console.error("S3 upload error:", error);
      res.status(500).json({ 
        message: "Failed to upload file", 
        error: error.message 
      });
    }
  });

  // Get presigned download URL for S3 object
  app.get('/api/s3/download', isAuthenticated, async (req: any, res) => {
    try {
      const { bucket, key } = req.query;
      const userId = req.user.id;
      const credentials = getS3CredentialsFromSession(userId);
      
      if (!credentials) {
        return res.status(400).json({ message: "No AWS credentials found. Please connect first." });
      }

      if (!bucket || !key) {
        return res.status(400).json({ message: "Bucket name and key are required" });
      }

      const downloadUrl = await s3Service.getPresignedDownloadUrl(
        bucket as string,
        key as string,
        credentials
      );
      
      res.json({ downloadUrl });
    } catch (error: any) {
      console.error("Error generating download URL:", error);
      res.status(500).json({ 
        message: "Failed to generate download URL", 
        error: error.message 
      });
    }
  });

  // Delete S3 objects
  app.delete('/api/s3/objects', isAuthenticated, async (req: any, res) => {
    try {
      const { bucket, keys } = req.body;
      const userId = req.user.id;
      const credentials = getS3CredentialsFromSession(userId);
      
      if (!credentials) {
        return res.status(400).json({ message: "No AWS credentials found. Please connect first." });
      }

      if (!bucket || !keys || !Array.isArray(keys) || keys.length === 0) {
        return res.status(400).json({ message: "Bucket name and array of keys are required" });
      }

      // Delete objects from S3
      const deleteResults = await s3Service.deleteS3Objects(bucket, keys, credentials);
      
      res.json({ 
        success: true, 
        message: `Successfully deleted ${deleteResults.deleted.length} object(s)`,
        deleted: deleteResults.deleted,
        errors: deleteResults.errors
      });
    } catch (error: any) {
      console.error("Error deleting S3 objects:", error);
      res.status(500).json({ 
        message: "Failed to delete objects", 
        error: error.message 
      });
    }
  });

  // Check S3 connection status
  app.get('/api/s3/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const isConnected = hasS3CredentialsInSession(userId);
      const credentials = getS3CredentialsFromSession(userId);
      
      res.json({ 
        connected: isConnected,
        region: credentials?.region || null
      });
    } catch (error) {
      console.error("Error checking S3 status:", error);
      res.status(500).json({ message: "Failed to check S3 status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
