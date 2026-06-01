const mongoose = require('mongoose');

async function main() {
  const uri = 'mongodb://127.0.0.1:27017/mytube';
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected!');

  // Recreate the exact Mongoose schema as defined in NestJS
  const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String },
    email: { type: String, unique: true, sparse: true },
    avatar: { type: String, default: "/assets/img/default-avatar.png" },
    role: { type: String, default: "viewer" },
    google_id: { type: String, unique: true, sparse: true },
    facebook_id: { type: String, unique: true, sparse: true },
    github_id: { type: String, unique: true, sparse: true },
    discord_id: { type: String, unique: true, sparse: true },
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    purchased_videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    balance: { type: Number, default: 0 },
    adBalance: { type: Number, default: 0 },
    is_premium: { type: Boolean, default: false },
    status: { type: String, default: "ACTIVE" },
  }, { timestamps: true });

  const UserModel = mongoose.model('User', UserSchema);

  const queryVal = "undefined";
  console.log('\n--- TESTING REAL QUERY WITH "undefined" string ---');
  try {
    const matchedUser = await UserModel.findOne({
      $or: [
        { facebook_id: queryVal },
        { google_id: queryVal },
        { github_id: queryVal },
        { discord_id: queryVal },
      ],
    }).exec();
    console.log('Matched User:', matchedUser ? matchedUser.username : 'None');
  } catch (err) {
    console.error('Error querying:', err);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
