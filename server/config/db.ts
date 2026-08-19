import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Fast fail for bufferCommands so requests don't hang if DB is offline
mongoose.set('bufferCommands', false);

export const dbStatusInfo = {
  attempted: false,
  connected: false,
  state: 'disconnected',
  targetDb: 'NextPlatform',
  host: '',
  uriFound: false,
  maskedUri: '',
  lastError: null as string | null,
  lastAttemptAt: '',
  userCount: 0
};

export function getMongoUri(): string | null {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) return process.env.MONGODB_URI.trim();
  if (process.env.MONGO_URI && process.env.MONGO_URI.trim()) return process.env.MONGO_URI.trim();

  // Try reading .env
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/MONGODB_URI\s*=\s*([^\r\n]+)/);
      if (match && match[1]?.trim()) return match[1].trim();
    }
  } catch (e) {}

  // Fallback try reading .env.example
  try {
    const examplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(examplePath)) {
      const content = fs.readFileSync(examplePath, 'utf8');
      const match = content.match(/MONGODB_URI\s*=\s*([^\r\n]+)/);
      if (match && match[1]?.trim()) return match[1].trim();
    }
  } catch (e) {}

  return null;
}

export async function connectDB() {
  const mongoUri = getMongoUri();
  dbStatusInfo.attempted = true;
  dbStatusInfo.lastAttemptAt = new Date().toISOString();
  
  if (mongoUri) {
    dbStatusInfo.uriFound = true;
    // Mask password for display
    dbStatusInfo.maskedUri = mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');

    try {
      // If URI doesn't explicitly contain a path, target NextPlatform database
      const hasDbInPath = mongoUri.match(/mongodb\.net\/([^?]+)/);
      const targetDb = hasDbInPath && hasDbInPath[1] ? hasDbInPath[1] : 'NextPlatform';
      dbStatusInfo.targetDb = targetDb;

      await mongoose.connect(mongoUri, { 
        serverSelectionTimeoutMS: 8000,
        dbName: targetDb
      });

      dbStatusInfo.connected = true;
      dbStatusInfo.state = 'connected';
      dbStatusInfo.host = mongoose.connection.host || 'MongoDB Atlas';
      dbStatusInfo.lastError = null;

      console.log(`✅ Connected to MongoDB Database "${targetDb}" successfully on host: ${dbStatusInfo.host}`);
      return true;
    } catch (err: any) {
      dbStatusInfo.connected = false;
      dbStatusInfo.state = 'connection_error';
      dbStatusInfo.lastError = err?.message || String(err);
      console.warn('⚠️ MongoDB connection attempt failed. Error details:', dbStatusInfo.lastError);
      return false;
    }
  } else {
    dbStatusInfo.uriFound = false;
    dbStatusInfo.state = 'no_uri';
    console.log('ℹ️ No MONGODB_URI detected. GoldBod Pro running in high-performance Memory Data Store mode.');
    return false;
  }
}



