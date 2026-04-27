import "dotenv/config";
import { db } from './src/lib/db';

async function run() {
  try {
    const rows = await db.query<any[]>('DESC channels');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err: any) {
    console.error('ERROR:', err.message);
  } finally {
    process.exit();
  }
}

run();
