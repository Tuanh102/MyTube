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
// 2. MAIN SEEDING ROUTINE
// ----------------------------------------------------
async function seedDatabase() {
  console.log(`🔌 Connecting to MongoDB at: ${MONGODB_URI}...`);
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to database successfully.');

    const db = mongoose.connection.db;

    // List of collections we want to reset
    const collectionsToReset = ['users', 'channels', 'videos', 'comments', 'playlists', 'orders'];

    console.log('\n🧹 Clearing old database records...');
    for (const colName of collectionsToReset) {
      const collections = await db.listCollections({ name: colName }).toArray();
      if (collections.length > 0) {
        await db.collection(colName).deleteMany({});
        console.log(`  - Cleaned all records from collection: "${colName}"`);
      }
    }
    console.log('✅ Old records successfully wiped.');

    // ----------------------------------------------------
    // 3. GENERATE LINKED MOCK OBJECT IDS
    // ----------------------------------------------------
    const userId = new mongoose.Types.ObjectId();
    const channelId = new mongoose.Types.ObjectId();
    const videoId1 = new mongoose.Types.ObjectId();
    const videoId2 = new mongoose.Types.ObjectId();
    const videoId3 = new mongoose.Types.ObjectId();

    console.log('\n🌱 Seeding initial documents...');

    // 3.1. Seed VIP Administrator User (Tuanh102)
    const userDoc = {
      _id: userId,
      username: 'Tuanh102',
      email: 'ttattatto96@gmail.com',
      avatar: '/assets/img/avata.jpg',
      role: 'admin',
      balance: 500000, // 500k coins
      is_premium: true,
      premium_type: 'PREMIUM_MONTH',
      premium_purchased_at: new Date('2026-05-15T00:00:00.000Z'),
      premium_expires_at: new Date('2026-06-14T00:00:00.000Z'),
      history: [videoId1],
      purchased_videos: [],
      createdAt: new Date('2026-05-10T00:00:00.000Z'),
      updatedAt: new Date('2026-05-15T00:00:00.000Z')
    };
    await db.collection('users').insertOne(userDoc);
    console.log('  - Seeded VIP User "Tuanh102" (ttattatto96@gmail.com)');

    // 3.2. Seed System Channel
    const channelDoc = {
      _id: channelId,
      channel_name: 'Tuanh IT',
      description: 'Kênh công nghệ chia sẻ kiến thức lập trình, Next.js và thiết kế hệ thống cao cấp.',
      avatar_url: '/assets/img/avata.jpg',
      banner_url: '/assets/img/bannerXanhSM.png',
      is_verified: true,
      user: userId,
      createdAt: new Date('2026-05-11T00:00:00.000Z'),
      updatedAt: new Date('2026-05-11T00:00:00.000Z')
    };
    await db.collection('channels').insertOne(channelDoc);
    console.log('  - Seeded Channel "Tuanh IT"');

    // 3.3. Seed High-Quality Videos
    const videoDocs = [
      {
        _id: videoId1,
        title: 'Hướng dẫn sử dụng Claude',
        description: 'Video hướng dẫn làm quen với trợ lý AI thông minh Claude để tăng gấp 3 lần năng suất lập trình và tối ưu hóa dự án thực tế.',
        video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
        video_public_id: 'demo/elephants',
        thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        thumbnail_public_id: 'unsplash/futuristic',
        duration: 100,
        view_count: 6,
        likes: [userId],
        dislikes: [],
        category_id: '1',
        is_short: false,
        price: 0,
        is_free: true,
        status: 'APPROVED',
        channel: channelId,
        createdAt: new Date('2026-05-15T09:00:00.000Z'),
        updatedAt: new Date('2026-05-15T09:00:00.000Z')
      },
      {
        _id: videoId2,
        title: 'Nhạc ai đưa em về (remix)',
        description: 'Bản phối remix cực chill giúp bạn tăng khả năng tập trung, duy trì năng lượng tích cực trong suốt thời gian dài code liên tục.',
        video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
        video_public_id: 'demo/elephants',
        thumbnail_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
        thumbnail_public_id: 'unsplash/music',
        duration: 216,
        view_count: 85,
        likes: [],
        dislikes: [],
        category_id: '2',
        is_short: false,
        price: 0,
        is_free: true,
        status: 'APPROVED',
        channel: channelId,
        createdAt: new Date('2026-05-16T10:00:00.000Z'),
        updatedAt: new Date('2026-05-16T10:00:00.000Z')
      },
      {
        _id: videoId3,
        title: 'Lập trình Next.js đỉnh cao cùng Antigravity',
        description: 'Khám phá sâu các kiến trúc Frontend hiện đại bậc nhất, tối ưu hóa SEO và tích hợp các module cao cấp cùng Google Deepmind.',
        video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
        video_public_id: 'demo/elephants',
        thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        thumbnail_public_id: 'unsplash/code',
        duration: 320,
        view_count: 142,
        likes: [userId],
        dislikes: [],
        category_id: '1',
        is_short: false,
        price: 25000,
        is_free: false,
        status: 'APPROVED',
        channel: channelId,
        createdAt: new Date('2026-05-19T00:00:00.000Z'),
        updatedAt: new Date('2026-05-19T00:00:00.000Z')
      }
    ];
    await db.collection('videos').insertMany(videoDocs);
    console.log('  - Seeded 3 High-Quality Videos');

    // 3.4. Seed Subscription Orders
    const orderDocs = [
      {
        _id: new mongoose.Types.ObjectId(),
        orderCode: 992178,
        amount: 25000,
        description: 'Premium VIP',
        status: 'PAID',
        user: userId,
        createdAt: new Date('2026-05-15T00:00:00.000Z'),
        updatedAt: new Date('2026-05-15T00:00:00.000Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        orderCode: 129382,
        amount: 0,
        description: 'MyTube Thử nghiệm',
        status: 'EXPIRED',
        user: userId,
        createdAt: new Date('2026-03-15T00:00:00.000Z'),
        updatedAt: new Date('2026-03-15T00:00:00.000Z')
      }
    ];
    await db.collection('orders').insertMany(orderDocs);
    console.log('  - Seeded 2 Invoices/Payments in subscription history');

    // 3.5. Seed Default Comments
    const commentDocs = [
      {
        _id: new mongoose.Types.ObjectId(),
        content: 'Bài viết và hướng dẫn sử dụng rất chi tiết, rất đáng giá cho anh em Developer học hỏi!',
        user: userId,
        video: videoId1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await db.collection('comments').insertMany(commentDocs);
    console.log('  - Seeded Initial Video Comments');

    console.log('\n🎉 DATABASE RESET AND SEEDING COMPLETED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('❌ Error during seeding process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB safely.');
    process.exit(0);
  }
}

seedDatabase();
