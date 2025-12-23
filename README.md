# HTTPS Image Storage for RisuAI

A simple HTTPS-based image storage server that allows you to upload and retrieve images for use in RisuAI and other applications.

## Features

- 📤 Upload images via HTTPS
- 📥 Retrieve images via unique URLs
- 🔒 CORS-enabled for cross-origin requests
- 🖼️ Supports JPEG, PNG, GIF, and WebP formats
- 📊 List all uploaded images
- 🚀 Easy integration with RisuAI
- 🛡️ Rate limiting for security (100 uploads/15min, 500 file access/15min per IP)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/tigerbus7-crypto/-
cd -
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Starting the Server

```bash
npm start
```

The server will start on port 3000 by default (or use PORT environment variable).

### API Endpoints

#### 1. Upload Image
**POST** `/upload`

Upload an image file.

```bash
curl -X POST -F "image=@/path/to/image.jpg" http://localhost:3000/upload
```

Response:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "filename": "1234567890-123456789.jpg",
  "url": "http://localhost:3000/images/1234567890-123456789.jpg",
  "size": 123456
}
```

#### 2. Retrieve Image
**GET** `/images/:filename`

Retrieve an uploaded image by filename.

```bash
curl http://localhost:3000/images/1234567890-123456789.jpg --output image.jpg
```

Or simply open in browser: `http://localhost:3000/images/1234567890-123456789.jpg`

#### 3. List All Images
**GET** `/images`

Get a list of all uploaded images.

```bash
curl http://localhost:3000/images
```

Response:
```json
{
  "count": 2,
  "images": [
    {
      "filename": "1234567890-123456789.jpg",
      "url": "http://localhost:3000/images/1234567890-123456789.jpg"
    }
  ]
}
```

## Using with RisuAI

1. Start this server
2. Upload an image using the `/upload` endpoint
3. Copy the returned URL
4. Use the URL in RisuAI to display the image

Example using HTML/JavaScript in RisuAI:
```javascript
// Upload image
const formData = new FormData();
formData.append('image', imageFile);

fetch('http://localhost:3000/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Image URL:', data.url);
  // Use data.url in RisuAI
});
```

## Configuration

- **PORT**: Set environment variable `PORT` to change the server port (default: 3000)
- **File Size Limit**: Maximum 10MB per image (configurable in server.js)
- **Allowed Formats**: JPEG, PNG, GIF, WebP
- **Rate Limits**: 
  - Upload: 100 requests per 15 minutes per IP
  - File Access: 500 requests per 15 minutes per IP

## Security Features

- ✅ Rate limiting on all file system access endpoints
- ✅ File type validation
- ✅ File size limits
- ✅ CORS support for controlled access

For production use, also consider:
- Using HTTPS with proper SSL certificates (deploy behind nginx/Apache or use a hosting platform)
- Adding authentication/authorization
- Validating file contents beyond extension checking
- Setting up proper file storage (e.g., cloud storage)

## License

MIT