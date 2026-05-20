import * as fs from 'fs';
import * as path from 'path';
import mongoose from 'mongoose';

// ----------------------------------------------------
// 1. DYNAMIC ENV PARSER (Parses Root .env)
// ----------------------------------------------------
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

// ----------------------------------------------------
// 2. MAIN CLEARING ROUTINE
// ----------------------------------------------------
async function clearDatabase() {
  console.log(`🔌 Connecting to MongoDB at: ${MONGODB_URI}...`);
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to database successfully.');

    const db = mongoose.connection.db;

    // List of ALL collections to wipe out
    const collectionsToClear = ['users', 'channels', 'videos', 'comments', 'playlists', 'orders', 'tickets'];

    console.log('\n🧹 Clearing all collections completely...');
    for (const colName of collectionsToClear) {
      const collections = await db.listCollections({ name: colName }).toArray();
      if (collections.length > 0) {
        await db.collection(colName).deleteMany({});
        console.log(`  - 🗑️ Emptied all documents from: "${colName}"`);
      }
    }
    
    console.log('\n✅ DATABASE HAS BEEN COMPLETELY EMPTIED!');
    console.log('💡 System is now in a 100% clean, cold-start state.');
    console.log('💡 You can now sign up, register channels, and upload files from scratch to verify the flow.');
    
  } catch (error) {
    console.error('❌ Error during clearing process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB safely.');
    process.exit(0);
  }
}

clearDatabase();
