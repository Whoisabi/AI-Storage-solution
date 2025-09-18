import {
  users,
  files,
  folders,
  type User,
  type UpsertUser,
  type File,
  type InsertFile,
  type Folder,
  type InsertFolder,
} from "@shared/schema";
import { db } from "./db-docker";
import { eq, desc, and, isNull } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // File operations
  createFile(file: InsertFile): Promise<File>;
  getFilesByUserId(userId: string, folderId?: number): Promise<File[]>;
  getFileById(id: number): Promise<File | undefined>;
  updateFileSharing(id: number, isShared: boolean, shareToken?: string): Promise<File | undefined>;
  deleteFile(id: number): Promise<void>;
  getSharedFile(shareToken: string): Promise<File | undefined>;
  
  // Folder operations
  createFolder(folder: InsertFolder): Promise<Folder>;
  getFoldersByUserId(userId: string, parentId?: number): Promise<Folder[]>;
  getFolderById(id: number): Promise<Folder | undefined>;
  updateFolderSharing(id: number, isShared: boolean, shareToken?: string): Promise<Folder | undefined>;
  deleteFolder(id: number): Promise<void>;
  getSharedFolder(shareToken: string): Promise<Folder | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // File operations
  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db
      .insert(files)
      .values(file)
      .returning();
    return newFile;
  }

  async getFilesByUserId(userId: string, folderId?: number): Promise<File[]> {
    const condition = folderId 
      ? and(eq(files.userId, userId), eq(files.folderId, folderId))
      : and(eq(files.userId, userId), isNull(files.folderId));
      
    return await db
      .select()
      .from(files)
      .where(condition)
      .orderBy(desc(files.uploadedAt));
  }

  async getFileById(id: number): Promise<File | undefined> {
    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.id, id));
    return file;
  }

  async updateFileSharing(id: number, isShared: boolean, shareToken?: string): Promise<File | undefined> {
    const [file] = await db
      .update(files)
      .set({
        isShared,
        shareToken,
        updatedAt: new Date(),
      })
      .where(eq(files.id, id))
      .returning();
    return file;
  }

  async deleteFile(id: number): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  async getSharedFile(shareToken: string): Promise<File | undefined> {
    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.shareToken, shareToken));
    return file;
  }

  // Folder operations
  async createFolder(folder: InsertFolder): Promise<Folder> {
    const result = await db
      .insert(folders)
      .values(folder)
      .returning();
    return result[0];
  }

  async getFoldersByUserId(userId: string, parentId?: number): Promise<Folder[]> {
    const condition = parentId 
      ? and(eq(folders.userId, userId), eq(folders.parentId, parentId))
      : and(eq(folders.userId, userId), isNull(folders.parentId));
      
    return await db
      .select()
      .from(folders)
      .where(condition)
      .orderBy(desc(folders.createdAt));
  }

  async getFolderById(id: number): Promise<Folder | undefined> {
    const [folder] = await db
      .select()
      .from(folders)
      .where(eq(folders.id, id));
    return folder;
  }

  async updateFolderSharing(id: number, isShared: boolean, shareToken?: string): Promise<Folder | undefined> {
    const [folder] = await db
      .update(folders)
      .set({
        isShared,
        shareToken,
        updatedAt: new Date(),
      })
      .where(eq(folders.id, id))
      .returning();
    return folder;
  }

  async deleteFolder(id: number): Promise<void> {
    await db.delete(folders).where(eq(folders.id, id));
  }

  async getSharedFolder(shareToken: string): Promise<Folder | undefined> {
    const [folder] = await db
      .select()
      .from(folders)
      .where(eq(folders.shareToken, shareToken));
    return folder;
  }
}

export const storage = new DatabaseStorage();
