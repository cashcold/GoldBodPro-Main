import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Fast fail for bufferCommands so requests don't hang if DB is offline
mongoose.set('bufferCommands', false);

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
  
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Connected to MongoDB Database successfully.');
      return true;
    } catch (err) {
      console.warn('⚠️ MongoDB connection attempt failed. Running in resilient in-memory store mode:', err);
      return false;
    }
  } else {
    console.log('ℹ️ No MONGODB_URI detected. GoldBod Pro running in high-performance Memory Data Store mode.');
    return false;
  }
}


