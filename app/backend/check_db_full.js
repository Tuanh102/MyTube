const mongoose = require('mongoose');

async function main() {
  const uri = 'mongodb://127.0.0.1:27017/mytube';
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected!');

  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log('\n--- DANH SÁCH USER ---');
  for (const u of users) {
    console.log(`- Username: ${u.username} | Phone: ${u.phone} | Email: ${u.email} | _id: ${u._id} | balance: ${u.balance} | purchased_videos: ${JSON.stringify(u.purchased_videos)}`);
  }

  const channels = await mongoose.connection.db.collection('channels').find({}).toArray();
  console.log('\n--- DANH SÁCH CHANNEL ---');
  for (const c of channels) {
    console.log(`- ChannelName: ${c.channel_name} | User: ${c.user} | _id: ${c._id}`);
  }

  const videos = await mongoose.connection.db.collection('videos').find({}).toArray();
  console.log('\n--- DANH SÁCH VIDEO ---');
  for (const v of videos) {
    console.log(`- VideoTitle: ${v.title} | Channel: ${v.channel} | Price: ${v.price} | is_free: ${v.is_free} | _id: ${v._id}`);
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected safely.');
}

main().catch(console.error);
