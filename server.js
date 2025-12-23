const express = require('express');
const multer = require('multer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for RisuAI integration
app.use(cors());
app.use(express.json());

// Rate limiting for upload endpoint
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many upload requests, please try again later.'
});

// Rate limiting for file access endpoints
const fileAccessLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: 'Too many requests, please try again later.'
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Image Storage Server for RisuAI',
    endpoints: {
      upload: 'POST /upload - Upload an image',
      retrieve: 'GET /images/:filename - Retrieve an image',
      list: 'GET /images - List all images'
    }
  });
});

// Upload endpoint
app.post('/upload', uploadLimiter, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/images/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      filename: req.file.filename,
      url: imageUrl,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve image endpoint
app.get('/images/:filename', fileAccessLimiter, (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.sendFile(filepath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all images endpoint
app.get('/images', fileAccessLimiter, (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const protocol = req.protocol;
    const host = req.get('host');

    const images = files.map(file => ({
      filename: file,
      url: `${protocol}://${host}/images/${file}`
    }));

    res.json({
      count: images.length,
      images: images
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: error.message });
  }
  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Image Storage Server running on port ${PORT}`);
  console.log(`Upload images: POST http://localhost:${PORT}/upload`);
  console.log(`Retrieve images: GET http://localhost:${PORT}/images/:filename`);
  console.log(`Note: For production use with HTTPS, deploy behind a reverse proxy (nginx, Apache) or use a hosting platform with SSL support`);
});
