const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');


const housesRouter    = require('./routes/houses');
const authRouter      = require('./routes/auth');
const accountsRouter  = require('./routes/accounts');
const enquiriesRouter = require('./routes/enquiries');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// API Routes
app.use('/api/houses',    housesRouter);
app.use('/api/auth',      authRouter);
app.use('/api/accounts',  accountsRouter);
app.use('/api/enquiries', enquiriesRouter);

// Statically serve frontend files (prefer production dist if built, fallback to frontend)
const distPath = path.join(__dirname, '../dist');
const frontendPath = path.join(__dirname, '../frontend');
const clientPath = fs.existsSync(distPath) ? distPath : frontendPath;

app.use(express.static(clientPath));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(clientPath, 'index.html'));
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
