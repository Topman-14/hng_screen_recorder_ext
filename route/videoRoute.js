const express = require('express');
const multer = require('multer');
const router = express.Router();
const { handleVideoUpload, streamVideo } = require('../controller/videoController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define video upload route
router.post('/upload', handleVideoUpload);
router.get("/stream/:fileName", streamVideo)

module.exports = router;
