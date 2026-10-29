const express = require('express');
const cors = require('cors');
const path = require('path');

const housesRouter = require('./routes/houses');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Single unified API Route
app.use('/api/houses', housesRouter);

// Statically serve frontend files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Fallback to frontend index.html for client-side routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`  KejaKU Backend Server running!               `);
  console.log(`  - Local:   http://localhost:${PORT}          `);
  console.log(`  - API:     http://localhost:${PORT}/api/houses`);
  console.log(`===============================================`);
});

module.exports = app;
