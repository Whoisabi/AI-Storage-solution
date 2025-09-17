#!/usr/bin/env node

/**
 * Production database schema setup
 * This script ensures the database schema is properly synchronized
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('🔗 Connecting to database...');
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const db = drizzle(pool);

  try {
    console.log('🔄 Setting up database schema...');
    
    // Test database connectivity first
    console.log('🔗 Testing database connection...');
    await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    
    // Check if we should use drizzle-kit for schema synchronization
    const useSchemaSync = !fs.existsSync(join(__dirname, '..', 'migrations'));
    
    if (useSchemaSync) {
      console.log('📝 Using schema synchronization approach');
      console.log('🔧 Attempting to synchronize database schema...');
      
      // Try to run schema synchronization using npm run command
      try {
        const { spawn } = await import('child_process');
        
        console.log('🔧 Running: npm run db:push');
        // Execute npm run db:push command with proper environment
        const pushProcess = spawn('npm', ['run', 'db:push'], {
          stdio: 'inherit',
          env: { ...process.env, DATABASE_URL: databaseUrl },
          cwd: join(__dirname, '..')
        });
        
        await new Promise((resolve, reject) => {
          pushProcess.on('close', (code) => {
            if (code === 0) {
              console.log('✅ Schema synchronized successfully!');
              resolve();
            } else {
              reject(new Error(`Schema push failed with code ${code}`));
            }
          });
          pushProcess.on('error', reject);
        });
        
      } catch (error) {
        console.log('⚠️  drizzle-kit not available, checking if tables exist...');
        
        // Verify critical tables exist
        const tables = ['users', 'files', 'folders', 'shared_files'];
        let missingTables = [];
        
        for (const table of tables) {
          try {
            await db.execute(`SELECT 1 FROM ${table} LIMIT 1`);
          } catch (err) {
            if (err.message.includes('does not exist')) {
              missingTables.push(table);
            }
          }
        }
        
        if (missingTables.length > 0) {
          console.error(`❌ Missing tables: ${missingTables.join(', ')}`);
          console.error('Schema synchronization failed. Please ensure the database is properly initialized.');
          process.exit(1);
        }
        
        console.log('✅ All required tables exist in database');
      }
    } else {
      console.log('📁 Found migrations folder, running file-based migrations...');
      const { migrate } = await import('drizzle-orm/node-postgres/migrator');
      await migrate(db, { migrationsFolder: join(__dirname, '..', 'migrations') });
      console.log('✅ File-based migrations completed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

export { runMigrations };