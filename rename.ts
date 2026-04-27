import "dotenv/config";
import { db } from './src/lib/db';

async function run() {
  try {
    console.log('Attempting to rename banner_url to avatar_url...');
    await db.query('ALTER TABLE channels CHANGE banner_url avatar_url VARCHAR(255)');
    console.log('SUCCESS');
  } catch (err: any) {
    console.error('FAILED:', err.message);
  } finally {
    process.exit();
  }
}

run();
