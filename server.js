const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from current directory
app.use(express.static(__dirname));

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve specific files
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

// Handle contact form submissions
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, company, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    
    // Create submission object
    const submission = {
      id: Date.now(),
      name,
      email,
      company: company || '',
      message,
      submittedAt: new Date().toISOString()
    };
    
    // Read existing submissions
    let submissions = [];
    const filePath = path.join(__dirname, 'submissions.json');
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      submissions = JSON.parse(data);
    } catch (e) {
      // File doesn't exist yet, start with empty array
      submissions = [];
    }
    
    // Add new submission
    submissions.push(submission);
    
    // Save to file
    fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));
    
    console.log('New contact form submission:', submission);
    
    // Return success response
    res.json({ 
      success: true, 
      message: 'Thank you! We\'ll be in touch soon.',
      submission 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

// Handle all other routes by serving index.html (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`VICON Studios running on port ${PORT}`);
});
