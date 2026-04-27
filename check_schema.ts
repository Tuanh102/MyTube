
import db from './src/lib/db';

async function checkSchema() {
    try {
        console.log('--- TABLES ---');
        const tables = await db.query<any[]>('SHOW TABLES');
        console.log(JSON.stringify(tables, null, 2));

        console.log('--- CHANNELS SCHEMA ---');
        try {
            const channelsDesc = await db.query<any[]>('DESC channels');
            console.log(JSON.stringify(channelsDesc, null, 2));
        } catch (e) {
            console.log('Channels table might not exist');
        }

        console.log('--- VIDEOS SCHEMA ---');
        const videosDesc = await db.query<any[]>('DESC videos');
        console.log(JSON.stringify(videosDesc, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

checkSchema();
