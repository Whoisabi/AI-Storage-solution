# AI Storage Solution - replit.md

## Overview

This is a modern cloud storage application built with a full-stack TypeScript architecture. The application provides secure file upload, management, and sharing capabilities with AWS S3 integration and Replit authentication. It features a React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database storage.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: express-session with PostgreSQL store
- **File Storage**: AWS S3 with presigned URLs
- **File Upload**: Multer for multipart form handling

### Database Schema
- **Users Table**: Stores user profile information (required for Replit Auth)
- **Sessions Table**: Handles session persistence (required for Replit Auth)
- **Files Table**: Tracks uploaded files with metadata, sharing settings, and S3 references

## Key Components

### Authentication System
- **Provider**: Replit Auth using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with 7-day TTL
- **Authorization**: Route-level protection with middleware
- **User Management**: Automatic user creation/updates on login

### File Management System
- **Upload**: Drag-and-drop interface with progress tracking
- **Storage**: AWS S3 with organized folder structure per user
- **Metadata**: File size, MIME type, original name tracking
- **Sharing**: Token-based public sharing with toggle controls
- **Operations**: Download, delete, and share functionality

### Database Layer
- **ORM**: Drizzle with PostgreSQL dialect
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Migrations**: Schema versioning with drizzle-kit
- **Types**: Auto-generated TypeScript types from schema

## Data Flow

1. **Authentication Flow**:
   - User initiates login via Replit Auth
   - OIDC provider validates credentials
   - Session created and stored in PostgreSQL
   - User profile upserted in database

2. **File Upload Flow**:
   - Client uploads file via multipart form
   - Server validates file and user authentication
   - File uploaded to S3 with user-specific key structure
   - File metadata stored in PostgreSQL
   - Client receives confirmation and updates UI

3. **File Sharing Flow**:
   - User toggles sharing for a file
   - Server generates unique share token
   - Public access URL created for shared files
   - Share status persisted in database

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **@aws-sdk/client-s3**: AWS S3 file storage operations
- **@radix-ui/***: Headless UI component primitives
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe database ORM

### Authentication
- **openid-client**: OpenID Connect authentication
- **passport**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server
- **tailwindcss**: Utility-first CSS framework

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with Replit modules
- **Database**: PostgreSQL 16 module
- **Port Configuration**: Internal port 5000, external port 80
- **Hot Reload**: Vite HMR with Express middleware integration

### Production Build
- **Frontend**: Vite builds to `dist/public`
- **Backend**: esbuild bundles server to `dist/index.js`
- **Assets**: Static files served from built frontend
- **Database**: Environment-based connection string

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `AWS_ACCESS_KEY_ID`: S3 access credentials
- `AWS_SECRET_ACCESS_KEY`: S3 secret key
- `AWS_S3_BUCKET_NAME`: Target S3 bucket
- `REPL_ID`: Replit application identifier

## Changelog

Changelog:
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.