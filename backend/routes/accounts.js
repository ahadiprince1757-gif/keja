const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const { requireAuth } = require('../middleware/auth');
const { getAccountById, updateAccount } = require('../data/accounts');
const { getAllHouses, getHouseById, addHouse, updateHouse, deleteHouse } = require('../data/houses');

const ENQUIRIES_FILE = path.join(__dirname, '../data/enquiries.json');

// ─── Enquiry Helpers ───────────────────────────────────────────────────────────
function readEnquiries() {
  try {
    if (!fs.existsSync(ENQUIRIES_FILE)) return [];
    return JSON.parse(fs.readFileSync(ENQUIRIES_FILE, 'utf8') || '[]');
  } catch { return []; }
}
function saveEnquiries(enquiries) {
  fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2), 'utf8');
}

// ─── House Routes (owner-scoped) ───────────────────────────────────────────────

/**
 * GET /api/accounts/me/houses
 * All houses belonging to the authenticated owner.
 */
router.get('/me/houses', requireAuth, async (req, res) => {
  try {
    const all = await getAllHouses();
    const mine = all.filter(h => h.ownerId === req.user.id);
    res.json({ success: true, count: mine.length, data: mine });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch your houses.' });
  }
});

/**
 * POST /api/accounts/me/houses
 * Create a house under the authenticated owner.
 */
router.post('/me/houses', requireAuth, async (req, res) => {
  try {
    const { title, area, type, rent } = req.body;
    if (!title || !area || !type || !rent) {
      return res.status(400).json({ success: false, error: 'title, area, type, and rent are required.' });
    }
    const created = await addHouse({ ...req.body, ownerId: req.user.id });

    // Add houseId to owner's account
    const account = await getAccountById(req.user.id);
    if (account) {
      const newIds = [...(account.houseIds || []), created.id];
      await updateAccount(req.user.id, { houseIds: newIds });
    }

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Create house error:', error);
    res.status(500).json({ success: false, error: 'Failed to create house.' });
  }
});

/**
 * PUT /api/accounts/me/houses/:id
 * Update a house — only if it belongs to the current owner.
 */
router.put('/me/houses/:id', requireAuth, async (req, res) => {
  try {
    const house = await getHouseById(req.params.id);
    if (!house) return res.status(404).json({ success: false, error: 'House not found.' });
    if (house.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You do not own this house.' });
    }
    const updated = await updateHouse(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update house.' });
  }
});

/**
 * DELETE /api/accounts/me/houses/:id
 * Delete a house — only if it belongs to the current owner.
 */
router.delete('/me/houses/:id', requireAuth, async (req, res) => {
  try {
    const house = await getHouseById(req.params.id);
    if (!house) return res.status(404).json({ success: false, error: 'House not found.' });
    if (house.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You do not own this house.' });
    }
    const ok = await deleteHouse(req.params.id);

    // Remove from owner's houseIds
    const account = await getAccountById(req.user.id);
    if (account) {
      await updateAccount(req.user.id, { houseIds: (account.houseIds || []).filter(id => id !== Number(req.params.id)) });
    }

    res.json({ success: true, deleted: ok });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete house.' });
  }
});

// ─── Enquiry / Chat Routes ─────────────────────────────────────────────────────

/**
 * GET /api/accounts/me/enquiries
 * All enquiries for all houses the owner owns.
 */
router.get('/me/enquiries', requireAuth, async (req, res) => {
  try {
    const allHouses = await getAllHouses();
    const myHouses = allHouses.filter(h => h.ownerId === req.user.id);
    const myHouseIds = new Set(myHouses.map(h => h.id));

    const enquiries = readEnquiries().filter(e => myHouseIds.has(Number(e.houseId)));

    // Attach house title for convenience
    const withHouse = enquiries.map(e => ({
      ...e,
      houseTitle: myHouses.find(h => h.id === Number(e.houseId))?.title || 'Unknown'
    }));

    res.json({ success: true, count: withHouse.length, data: withHouse });
  } catch (error) {
    console.error('Fetch enquiries error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries.' });
  }
});

/**
 * POST /api/accounts/me/enquiries/:enquiryId/reply
 * Owner appends a reply message to an enquiry thread.
 * Body: { text }
 */
router.post('/me/enquiries/:enquiryId/reply', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Reply text is required.' });
    }

    const enquiries = readEnquiries();
    const idx = enquiries.findIndex(e => e.id === req.params.enquiryId);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Enquiry not found.' });

    const enquiry = enquiries[idx];

    // Verify owner owns this house
    const house = await getHouseById(enquiry.houseId);
    if (!house || house.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You cannot reply to this enquiry.' });
    }

    // Ensure messages array exists
    if (!Array.isArray(enquiry.messages)) {
      enquiry.messages = [];
    }

    const newMessage = {
      from: 'owner',
      senderName: req.user.name,
      text: text.trim(),
      at: new Date().toISOString(),
    };
    enquiry.messages.push(newMessage);
    enquiry.status = 'replied';
    enquiry.updatedAt = new Date().toISOString();

    saveEnquiries(enquiries);
    res.json({ success: true, message: newMessage, enquiry });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ success: false, error: 'Failed to send reply.' });
  }
});

/**
 * GET /api/accounts/me/profile
 * Owner profile info.
 */
router.get('/me/profile', requireAuth, async (req, res) => {
  try {
    const account = await getAccountById(req.user.id);
    if (!account) return res.status(404).json({ success: false, error: 'Account not found.' });
    const { passwordHash, ...safe } = account;
    res.json({ success: true, user: safe });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile.' });
  }
});

/**
 * PUT /api/accounts/me/profile
 * Update name, phone fields.
 */
router.put('/me/profile', requireAuth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updated = await updateAccount(req.user.id, { name, phone });
    if (!updated) return res.status(404).json({ success: false, error: 'Account not found.' });
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});


/**
 * GET /api/accounts/me/student-enquiries
 * All enquiries sent by this student (by userId or studentPhone/email).
 */
router.get('/me/student-enquiries', requireAuth, async (req, res) => {
  try {
    const allEnquiries = readEnquiries();
    const userPhone = req.user.phone ? req.user.phone.toString().trim() : '';
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';

    const mine = allEnquiries.filter(e => {
      if (e.userId && e.userId === req.user.id) return true;
      if (e.user_id && e.user_id === req.user.id) return true;
      const sPhone = e.studentPhone ? e.studentPhone.toString().trim() : '';
      if (userPhone && sPhone && (sPhone.includes(userPhone) || userPhone.includes(sPhone))) return true;
      if (userEmail && sPhone && sPhone.toLowerCase() === userEmail) return true;
      return false;
    });

    res.json({ success: true, count: mine.length, data: mine });
  } catch (error) {
    console.error('Student enquiries fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages.' });
  }
});

/**
 * POST /api/accounts/me/student-enquiries/:enquiryId/reply
 * Student appends a message to their existing thread.
 */
router.post('/me/student-enquiries/:enquiryId/reply', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Message text is required.' });
    }

    const enquiries = readEnquiries();
    const idx = enquiries.findIndex(e => e.id === req.params.enquiryId);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Conversation not found.' });

    const enquiry = enquiries[idx];

    if (!Array.isArray(enquiry.messages)) {
      enquiry.messages = [];
    }

    const newMessage = {
      from: 'customer',
      senderName: req.user.name || 'Student',
      text: text.trim(),
      at: new Date().toISOString(),
    };

    enquiry.messages.push(newMessage);
    enquiry.status = 'open';
    enquiry.updatedAt = new Date().toISOString();

    saveEnquiries(enquiries);
    res.json({ success: true, message: newMessage, enquiry });
  } catch (error) {
    console.error('Student reply error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
});

module.exports = router;
