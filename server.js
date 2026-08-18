const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory FIRST
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve static files from the root directory (for styles.css, script.js)
app.use(express.static(__dirname));

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// NO catch-all route - let Express handle 404s for missing files

app.listen(PORT, () => {
  console.log(`VICON Studios running on port ${PORT}`);
  console.log(`Serving files from: ${__dirname}`);
});
