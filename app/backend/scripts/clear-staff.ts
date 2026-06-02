import * as fs from 'fs';
import * as path from 'path';
import mongoose from 'mongoose';

const loadEnv = () => {
  const envPath = path.join(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
    console.log('⚡ Environmental variables successfully loaded from root .env');
  } else {
    console.log('⚠️ Root .env file not found, using default fallback database configuration.');
  }
};

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mytube';

async function clearStaff() {
  console.log(`🔌 Connecting to MongoDB at: ${MONGODB_URI}...`);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to database successfully.');

    const db = mongoose.connection.db;
    console.log('🧹 Wiping all staff accounts from database...');
    const result = await db.collection('admins').deleteMany({ role: 'STAFF' });
    console.log(`✅ Completed! Deleted ${result.deletedCount} staff accounts.`);
  } catch (error) {
    console.error('❌ Error clearing staff accounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected safely.');
    process.exit(0);
  }
}

clearStaff();
