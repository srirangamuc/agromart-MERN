// testUpload.js
const express = require('express');
const router = express.Router();
const upload = require('../multer-cloudinary');

router.post('/test-upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file format' });
  }

  res.json({
    message: 'File uploaded successfully',
    cloudinaryUrl: req.file.path,
    fileInfo: req.file
  });
});

module.exports = router;
