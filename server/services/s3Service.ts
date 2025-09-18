import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, HeadObjectCommand, ListBucketsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "ai-storage-solution";

export interface UploadResult {
  key: string;
  bucket: string;
  location: string;
}

export interface S3Credentials {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
  sessionToken?: string;
}

export interface S3Bucket {
  name: string;
  creationDate?: Date;
}

export interface S3Object {
  key: string;
  lastModified?: Date;
  size?: number;
  storageClass?: string;
}

export interface S3ListResult {
  objects: S3Object[];
  prefixes: string[];
  nextToken?: string;
  isTruncated: boolean;
}

export class S3Service {
  
  // Create S3 client with per-user credentials or fallback to default
  private createS3Client(credentials?: S3Credentials, region?: string): S3Client {
    if (credentials) {
      return new S3Client({
        region: region || "us-east-1", // Use provided region or default
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
        },
        // Enable region-agnostic requests
        forcePathStyle: false,
        useGlobalEndpoint: false
      });
    }
    return s3Client; // fallback to default client
  }
  
  // Validate AWS credentials by attempting to list buckets
  async validateCredentials(credentials: S3Credentials): Promise<S3Bucket[]> {
    const client = this.createS3Client(credentials);
    const command = new ListBucketsCommand({});
    
    try {
      const response = await client.send(command);
      return response.Buckets?.map(bucket => ({
        name: bucket.Name || '',
        creationDate: bucket.CreationDate
      })) || [];
    } catch (error: any) {
      throw new Error(`Invalid AWS credentials: ${error.message}`);
    }
  }
  
  // List S3 buckets
  async listBuckets(credentials?: S3Credentials): Promise<S3Bucket[]> {
    const client = this.createS3Client(credentials);
    const command = new ListBucketsCommand({});
    
    const response = await client.send(command);
    return response.Buckets?.map(bucket => ({
      name: bucket.Name || '',
      creationDate: bucket.CreationDate
    })) || [];
  }
  
  // List objects in a bucket with optional prefix
  async listObjects(
    bucketName: string,
    prefix: string = '',
    credentials?: S3Credentials,
    continuationToken?: string,
    maxKeys: number = 1000
  ): Promise<S3ListResult> {
    let client = this.createS3Client(credentials);
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: '/',
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
    });
    
    try {
      const response = await client.send(command);
      
      return {
        objects: response.Contents?.map(obj => ({
          key: obj.Key || '',
          lastModified: obj.LastModified,
          size: obj.Size,
          storageClass: obj.StorageClass
        })) || [],
        prefixes: response.CommonPrefixes?.map(prefix => prefix.Prefix || '') || [],
        nextToken: response.NextContinuationToken,
        isTruncated: response.IsTruncated || false
      };
    } catch (error: any) {
      // Handle region redirect errors
      if (error.Code === 'PermanentRedirect' && error.Endpoint) {
        // Extract region from endpoint (e.g., bucket.s3-us-west-2.amazonaws.com)
        const regionMatch = error.Endpoint.match(/s3-([a-z0-9-]+)\.amazonaws\.com/);
        if (regionMatch && regionMatch[1]) {
          const correctRegion = regionMatch[1];
          console.log(`Retrying with correct region: ${correctRegion} for bucket: ${bucketName}`);
          
          // Create new client with correct region
          client = this.createS3Client(credentials, correctRegion);
          const retryResponse = await client.send(command);
          
          return {
            objects: retryResponse.Contents?.map(obj => ({
              key: obj.Key || '',
              lastModified: obj.LastModified,
              size: obj.Size,
              storageClass: obj.StorageClass
            })) || [],
            prefixes: retryResponse.CommonPrefixes?.map(prefix => prefix.Prefix || '') || [],
            nextToken: retryResponse.NextContinuationToken,
            isTruncated: retryResponse.IsTruncated || false
          };
        }
      }
      throw error;
    }
  }
  
  // Upload file to specific S3 bucket and path
  async uploadToS3(
    buffer: Buffer,
    bucketName: string,
    key: string,
    mimeType: string,
    credentials?: S3Credentials
  ): Promise<UploadResult> {
    const client = this.createS3Client(credentials);
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await client.send(command);

    return {
      key,
      bucket: bucketName,
      location: `https://${bucketName}.s3.amazonaws.com/${key}`,
    };
  }
  
  // Get presigned URL for downloading from any bucket
  async getPresignedDownloadUrl(
    bucketName: string,
    key: string,
    credentials?: S3Credentials,
    expiresIn: number = 3600
  ): Promise<string> {
    const client = this.createS3Client(credentials);
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
      ResponseContentDisposition: 'attachment'
    });

    return await getSignedUrl(client, command, { expiresIn });
  }
  
  // Delete object from any bucket
  async deleteS3Object(
    bucketName: string,
    key: string,
    credentials?: S3Credentials
  ): Promise<void> {
    const client = this.createS3Client(credentials);
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await client.send(command);
  }

  // Delete multiple objects from any bucket
  async deleteS3Objects(
    bucketName: string,
    keys: string[],
    credentials?: S3Credentials
  ): Promise<{ deleted: string[], errors: any[] }> {
    const client = this.createS3Client(credentials);
    
    // S3 DeleteObjectsCommand can handle up to 1000 objects at once
    const maxBatchSize = 1000;
    const deleted: string[] = [];
    const errors: any[] = [];
    
    // Process in batches
    for (let i = 0; i < keys.length; i += maxBatchSize) {
      const batch = keys.slice(i, i + maxBatchSize);
      
      const command = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: batch.map(key => ({ Key: key })),
          Quiet: false, // Return info about deleted objects
        },
      });

      try {
        const response = await client.send(command);
        
        // Track successfully deleted objects
        if (response.Deleted) {
          response.Deleted.forEach(obj => {
            if (obj.Key) deleted.push(obj.Key);
          });
        }
        
        // Track any errors
        if (response.Errors) {
          errors.push(...response.Errors);
        }
      } catch (error) {
        // If entire batch fails, add all keys to errors
        batch.forEach(key => {
          errors.push({
            Key: key,
            Code: 'BatchError',
            Message: error instanceof Error ? error.message : 'Unknown error'
          });
        });
      }
    }
    
    return { deleted, errors };
  }

  // Legacy methods for backward compatibility with existing app-managed files
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    userId: string
  ): Promise<UploadResult> {
    const key = `users/${userId}/${nanoid()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      Metadata: {
        userId,
        originalName: fileName,
      },
    });

    await s3Client.send(command);

    return {
      key,
      bucket: BUCKET_NAME,
      location: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
    };
  }

  async getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  }

  async getFileMetadata(key: string) {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    try {
      const response = await s3Client.send(command);
      return {
        size: response.ContentLength || 0,
        lastModified: response.LastModified,
        contentType: response.ContentType,
        metadata: response.Metadata,
      };
    } catch (error) {
      throw new Error(`File not found: ${key}`);
    }
  }

  async generateShareUrl(key: string, expiresIn: number = 86400): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }
}

export const s3Service = new S3Service();
