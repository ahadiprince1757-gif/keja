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
router.post('/', async (req, res) => {
  const { houseId, houseTitle, studentName, studentPhone, viewingDate, message, userId } = req.body;

  if (!studentName || !studentPhone) {
    return res.status(400).json({ success: false, error: 'Name and phone are required' });
  }

  const enquiry = {
    id: `enq_${Date.now()}`,
    user_id: userId || null,
    house_id: houseId || null,
    house_title: houseTitle || '',
    student_name: studentName,
    student_phone: studentPhone,
    viewing_date: viewingDate || null,
    message: message || '',
    status: 'open',
    messages: message
      ? [{ from: 'customer', senderName: studentName, text: message, at: new Date().toISOString() }]
      : [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = require('../supabase');
    await supabase.from('enquiries').insert([enquiry]);
  } catch (err) {
    console.warn('Enquiry Supabase sync note:', err.message);
  }

  const localEnquiry = {
    id: enquiry.id,
    userId: enquiry.user_id,
    houseId: enquiry.house_id,
    houseTitle: enquiry.house_title,
    studentName: enquiry.student_name,
    studentPhone: enquiry.student_phone,
    viewingDate: enquiry.viewing_date,
    message: enquiry.message,
    status: enquiry.status,
    messages: enquiry.messages,
    createdAt: enquiry.created_at,
    updatedAt: enquiry.updated_at,
  };

  const enquiries = getEnquiries();
  enquiries.unshift(localEnquiry);
  saveEnquiries(enquiries);

  res.status(201).json({
    success: true,
    message: 'Viewing request received successfully',
    data: localEnquiry
  });
});

module.exports = router;
