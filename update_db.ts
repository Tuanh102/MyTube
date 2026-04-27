
import dotenv from 'dotenv';
dotenv.config();
import db from './src/lib/db';

async function updateLiveDb() {
    try {
        console.log('Attempting to update database schema...');
        
        try {
            console.log('Dropping foreign key channels_ibfk_1...');
            await db.query('ALTER TABLE channels DROP FOREIGN KEY channels_ibfk_1');
        } catch (e: any) {
            console.log('Could not drop foreign key (might not exist):', e.message);
        }

        try {
            console.log('Dropping unique index user_id...');
            await db.query('ALTER TABLE channels DROP INDEX user_id');
        } catch (e: any) {
            console.log('Could not drop index (might not exist):', e.message);
        }

        console.log('Adding non-unique index user_id...');
        await db.query('ALTER TABLE channels ADD INDEX user_id (user_id)');

        console.log('Restoring foreign key channels_ibfk_1...');
        await db.query('ALTER TABLE channels ADD CONSTRAINT channels_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE');

        console.log('Database updated successfully!');
    } catch (error: any) {
        console.error('Error updating live database:', error.message);
    }
}

updateLiveDb();
