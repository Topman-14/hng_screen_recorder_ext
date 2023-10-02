require('dotenv').config();
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');


async function transcribeVideo(videoBuffer) {

    try {
        if (!videoBuffer || videoBuffer.length === 0) {
            throw new Error('No video data provided');
        }

        // Generate a unique filename for the video
        const fileName = `video_${Date.now()}.mp4`;

        // Create a write stream to save the video to the 'videos' folder
        const videoPath = path.join(__dirname, 'videos', fileName);
        const writeStream = fs.createWriteStream(videoPath);

        // Pipe the video buffer to the write stream
        writeStream.write(videoBuffer);

        // Extract audio from the video using ffmpeg
        const audioPath = path.join(__dirname, 'videos', `audio_${Date.now()}.wav`);

        await new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .audioCodec('pcm_s16le')
                .toFormat('wav')
                .on('end', resolve)
                .on('error', reject)
                .save(audioPath);
        });

        // Read the audio data
        const audioData = fs.readFileSync(audioPath);

        // Transcribe the audio using the OpenAI API
        const response = await axios.post("https://api.openai.com/v1/engines/whisper/transcribe", {
            audio: audioData.toString('base64'),
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const transcription = response.data.text;

        // Cleanup: Delete the temporary video and audio files
        fs.unlinkSync(videoPath);
        fs.unlinkSync(audioPath);

        return transcription;
    } catch (error) {
        console.error('Error transcribing video:', error);
        throw error;
    }
}


const handleVideoUpload = async (req, res) => {
    try {
        const file = req.body;

        if (!file) {
            return res.status(400).send('No video file uploaded');
        }

        // Generates a unique filename
        const fileName = `video_${Date.now()}.mp4`;
        
        // Create a write stream to save the video to the 'videos' folder
        const filePath = path.join(__dirname, '../videos', fileName);
        const writeStream = fs.createWriteStream(filePath);
        
        // Pipe the file buffer to the write stream
        writeStream.write(file);

        // When the stream is closed, it means the file is saved
        writeStream.end(async () => {
            try {
                console.log('Video saved to disk:', fileName);
                
                // Call the transcribeVideo function asynchronously
                const transcription = await transcribeVideo(file);
                
                // Send the transcription as the response
                res.send('Video uploaded and saved successfully. Transcription: ' + transcription);
            } catch (error) {
                console.error('Error transcribing video:', error);
                res.status(500).send('Error transcribing video');
            }
        });
    } catch (error) {
        console.error('Error handling video upload:', error);
        res.status(500).send('Error handling video upload');
    }
};

const streamVideo = async (req, res) => {
    try {
        // Get the video file name from a parameter in the request
        const { fileName } = req.params;

        // Check if the file exists in the directory
        const videoDirectory = path.join(__dirname, '../videos', fileName);


        if (!fs.existsSync(videoDirectory)) {
            return res.status(404).send('Video not found');
        }

        // Get the size of the video file
        const size = fs.statSync(videoDirectory).size;

        // Get the range header from the request
        const { range } = req.headers;

        if (!range) {
            return res.status(416).send('Range header needed');
        }

        // Parse the range header
        const [start, end] = range.replace(/bytes=/, '').split('-');
        const chunkSize = (end - start) + 1;

        // Set headers for the response
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
        };

        // Send 206 Partial Content status code
        res.writeHead(206, headers);

        // Create a read stream for the video file and pipe it to the response
        const stream = fs.createReadStream(videoDirectory, { start: Number(start), end: Number(end) });
        stream.pipe(res);
    } catch (error) {
        console.error('Error streaming video:', error);
        res.status(500).send('Error streaming video');
    }
};


module.exports = {
    handleVideoUpload,
    streamVideo
};
