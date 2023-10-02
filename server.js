require("dotenv").config()
const express = require('express');
const app = express();
const port = 5000;
const multer = require('multer');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const OpenAi = require("openai")


const videoRoutes = require('./route/videoRoute');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer for video file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.use('/', videoRoutes);

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});