import mongoose from 'mongoose';

// Fast fail for bufferCommands so requests don't hang if DB is offline
mongoose.set('bufferCommands', false);

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
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

