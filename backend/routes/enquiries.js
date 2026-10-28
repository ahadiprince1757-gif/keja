const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const ENQUIRIES_FILE = path.join(__dirname, '../data/enquiries.json');

function getEnquiries() {
  try {
    if (!fs.existsSync(ENQUIRIES_FILE)) return [];
    return JSON.parse(fs.readFileSync(ENQUIRIES_FILE, 'utf8') || '[]');
  } catch {
    return [];
  }
}

function saveEnquiries(list) {
  try {
    fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving enquiries:', err);
  }
}

/**
 * GET /api/enquiries
 */
router.get('/', (req, res) => {
  res.json({ success: true, data: getEnquiries() });
});

/**
 * POST /api/enquiries
 */
router.post('/', (req, res) => {
  const { houseId, houseTitle, studentName, studentPhone, viewingDate, message } = req.body;

  if (!studentName || !studentPhone) {
    return res.status(400).json({ success: false, error: 'Name and phone are required' });
  }

  const enquiry = {
    id: Date.now(),
    houseId,
    houseTitle,
    studentName,
    studentPhone,
    viewingDate: viewingDate || null,
    message: message || '',
    createdAt: new Date().toISOString()
  };

  const enquiries = getEnquiries();
  enquiries.unshift(enquiry);
  saveEnquiries(enquiries);

  res.status(201).json({
    success: true,
    message: 'Viewing request received successfully',
    data: enquiry
  });
});

module.exports = router;
