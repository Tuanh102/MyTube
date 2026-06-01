const mongoose = require('mongoose');

async function main() {
  const uri = 'mongodb://127.0.0.1:27017/mytube';
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected!');

  // Define User Schema to match Mongoose
  const userSchema = new mongoose.Schema({
    username: String,
    google_id: String,
    facebook_id: String,
    github_id: String,
    discord_id: String,
  });
  const UserModel = mongoose.model('User', userSchema);

  console.log('\n--- TESTING findById(undefined) ---');
  try {
    const matchedUser = await UserModel.findById(undefined).exec();
    console.log('Matched User (with undefined):', matchedUser ? matchedUser.username : 'None');
  } catch (err) {
    console.error('Error finding by id undefined:', err);
  }

  console.log('\n--- TESTING findById("undefined") ---');
  try {
    const matchedUser = await UserModel.findById("undefined").exec();
    console.log('Matched User (with "undefined" string):', matchedUser ? matchedUser.username : 'None');
  } catch (err) {
    console.error('Error finding by id "undefined" string:', err);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
