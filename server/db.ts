import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket constructor with SSL options
neonConfig.webSocketConstructor = ws;
// Disable pipelining for better compatibility
neonConfig.pipelineConnect = false;
// Disable fetch connection cache to avoid SSL issues
neonConfig.fetchConnectionCache = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    // Additional SSL options to handle certificate issues
    checkServerIdentity: () => undefined
  }
});
export const db = drizzle({ client: pool, schema });