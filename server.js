const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting VICON Studios server...');
console.log('Current directory:', __dirname);
console.log('Files in current directory:', fs.readdirSync(__dirname));

// Check if public directory exists
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  console.log('Public directory exists');
  console.log('Files in public:', fs.readdirSync(publicPath));
  
  const imagesPath = path.join(publicPath, 'images');
  if (fs.existsSync(imagesPath)) {
    console.log('Images directory exists');
    console.log('Image files:', fs.readdirSync(imagesPath));
  } else {
    console.log('WARNING: Images directory does not exist!');
  }
} else {
  console.log('WARNING: Public directory does not exist!');
}

// Serve static files from the public directory FIRST
app.use('/public', express.static(publicPath, {
  setHeaders: (res, filePath) => {
    console.log('Serving static file:', filePath);
  }
}));

// Serve static files from the root directory (for styles.css, script.js)
app.use(express.static(__dirname, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
      console.log('Serving root static file:', filePath);
    }
  }
}));

// Serve index.html for root route
app.get('/', (req, res) => {
  console.log('Serving index.html for root route');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use((req, res) => {
  console.log('404 - File not found:', req.url);
  res.status(404).send('File not found: ' + req.url);
});

app.listen(PORT, () => {
  console.log(`VICON Studios running on port ${PORT}`);
  console.log(`Serving files from: ${__dirname}`);
});
