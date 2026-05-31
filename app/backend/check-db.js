const mongoose = require('mongoose');

async function main() {
  const uri = 'mongodb://127.0.0.1:27017/mytube';
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected!');

  const videos = await mongoose.connection.db.collection('videos').find({}).toArray();
  console.log('\n--- DANH SÁCH VIDEO VÀ PHÂN LOẠI PHÍ ---');
  for (const v of videos) {
    console.log(`- Title: ${v.title} | Price: ${v.price} | is_free: ${v.is_free} | _id: ${v._id}`);
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected safely.');
}

main().catch(console.error);
