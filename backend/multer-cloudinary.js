const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary'); // the config from above

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'agromart_profiles', // or any folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
