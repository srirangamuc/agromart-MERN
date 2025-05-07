const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const verifyCloudinaryConnection = async () => {
  try {
    console.log('🔄 Verifying Cloudinary credentials...');
    const result = await cloudinary.api.ping();
    console.log(`✅ Cloudinary connection successful: ${result.status}`);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    
    if (error.http_code === 401) {
      console.error('❌ Authentication failed. Please check your Cloudinary credentials.');
      console.error('Make sure your .env file contains correct values for:');
      console.error('   - CLOUDINARY_CLOUD_NAME');
      console.error('   - CLOUDINARY_API_KEY');
      console.error('   - CLOUDINARY_API_SECRET');
    }
    return false;
  }
};

// Run verification immediately
verifyCloudinaryConnection();

module.exports = cloudinary;
