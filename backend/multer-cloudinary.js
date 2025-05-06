const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

console.log("⛅ Cloudinary config:", cloudinary.config()); // Log it

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'agromart_profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ quality: 'auto' }],
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files allowed!'), false);
    } else {
      cb(null, true);
    }
  }
});

module.exports = upload;
