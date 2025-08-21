const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the marketing directory
app.use(express.static(path.join(__dirname)));

// Handle all routes by serving index.html (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Marketing website running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});