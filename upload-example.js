#!/usr/bin/env node

/**
 * Example script for uploading images to the image storage server
 * Usage: node upload-example.js <image-file-path>
 */

const fs = require('fs');
const path = require('path');

const SERVER_URL = process.env.IMAGE_SERVER_URL || 'http://localhost:3000';

async function uploadImage(imagePath) {
  if (!fs.existsSync(imagePath)) {
    console.error(`Error: File not found: ${imagePath}`);
    process.exit(1);
  }

  const FormData = require('form-data');
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${SERVER_URL}/upload`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Upload successful!');
      console.log('📎 Image URL:', data.url);
      console.log('📁 Filename:', data.filename);
      console.log('📊 Size:', (data.size / 1024).toFixed(2), 'KB');
      console.log('\n💡 Use this URL in RisuAI to display your image');
    } else {
      console.error('❌ Upload failed:', data.error || 'Unknown error');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node upload-example.js <image-file-path>');
  console.log('Example: node upload-example.js ./my-image.png');
  process.exit(1);
}

uploadImage(args[0]);
