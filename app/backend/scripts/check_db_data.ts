import mongoose from 'mongoose';

async function main() {
  const uri = 'mongodb://127.0.0.1:27017/mytube';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected!');

  const usersCol = mongoose.connection.db.collection('users');
  const channelsCol = mongoose.connection.db.collection('channels');

  const users = await usersCol.find({}).toArray();
  const channels = await channelsCol.find({}).toArray();

  console.log('\n--- USERS ---');
  users.forEach(u => {
    console.log(`User ID: ${u._id} | Username: ${u.username} | Phone: ${u.phone} | Email: ${u.email}`);
  });

  console.log('\n--- CHANNELS ---');
  channels.forEach(c => {
    console.log(`Channel ID: ${c._id} | Name: ${c.channel_name} | User: ${c.user}`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);
