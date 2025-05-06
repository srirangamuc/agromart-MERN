// testUpload.js
const express = require('express');
const router = express.Router();
const upload = require('../multer-cloudinary');

router.post('/test-upload', upload.single('image'), (req, res) => {
    try {
        console.log("📥 File received:", req.file);

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        return res.status(200).json({
            message: "Upload successful",
            fileUrl: req.file.path,
        });
    } catch (error) {
        console.error("❌ Upload error:", error);
        return res.status(500).json({
            error: "Internal Server Error",
            message: "Something went wrong!"
        });
    }
});


module.exports = router;
