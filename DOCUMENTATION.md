# Chrome Screen Recorder Backend

This application is a server-side implementation designed to handle video uploads, transcribe the audio content of the uploaded video, and provide video streaming functionality. It's built using Node.js, Express.js, and various libraries for video processing and transcription.

## Features:

### Video Upload:

- **Endpoint:** `POST /api/videos/upload`
- **Description:** Allows users to upload video files.
- **Request Format:**
  - Method: POST
  - Body: Binary video file data
- **Response Format:**
  - Status Code: 200 OK (Success) or 400 Bad Request (Error)
  - Body (Success): JSON object with the following properties:
    - `message`: "Video uploaded and saved successfully. Transcription: {transcription}"
  - Body (Error): JSON object with the following properties:
    - `error`: "Error message describing the issue"

### Video Streaming:

- **Endpoint:** `GET /stream/:fileName`
- **Description:** Provides video streaming capability for uploaded videos.
- **Request Format:**
  - Method: GET
  - URL Parameter: `fileName` (Name of the video file to stream)
- **Response Format:**
  - Status Code: 206 Partial Content (Success), 404 Not Found (Video not found), 416 Range Not Satisfiable (Invalid range header), or 500 Internal Server Error (Error)
  - Headers:
    - `Content-Range`: Specifies the byte range of the response
    - `Accept-Ranges`: Indicates support for byte range requests
    - `Content-Length`: Length of the video chunk
    - `Content-Type`: MIME type of the video (e.g., video/mp4)
  - Body: Binary video data chunk

## Project Structure:

- **`server.js`:** Main entry point of the server application. Sets up Express.js, defines routes, and listens on a specified port (5000 by default).

- **`route/videoRoute.js`:** Express.js router that defines API endpoints for video upload and streaming.

- **`controller/videoController.js`:** Contains the logic for video transcoding and transcription.

## Dependencies:

- `express`: A web framework for Node.js used to build the server.

- `multer`: A middleware for handling file uploads, specifically designed for handling multipart/form-data.

- `fluent-ffmpeg`: A library for handling video and audio processing tasks, including video-to-audio extraction.

- `axios`: A promise-based HTTP client used for making API requests to the OpenAI service for audio transcription.

- `dotenv`: A library for loading environment variables from a `.env` file.

## How to Use:

1. Start the server by running `node server.js`.

2. Use the provided API endpoints to interact with the application:

   - Upload a video file using `POST /api/videos/upload`.
   - Stream a video using `GET /stream/:fileName`.

3. Ensure that you have an OpenAI API key set as an environment variable in a `.env` file:

