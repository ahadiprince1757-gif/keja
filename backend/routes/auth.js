const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { getAccountByEmail, addAccount, getAccountById } = require('../data/accounts');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';

/**
 * POST /api/auth/register
 * Body: { name, email, phone, password }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address.' });
    }

    // Check for duplicate
    const existing = getAccountByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create account
    const account = addAccount({ name, email, phone, passwordHash });

    // Issue token
    const token = jwt.sign(
      { id: account.id, email: account.email, role: account.role, name: account.name },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.status(201).json({ success: true, token, user: account });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const account = getAccountByEmail(email);
    if (!account) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, account.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const { passwordHash, ...safeAccount } = account;

    const token = jwt.sign(
      { id: safeAccount.id, email: safeAccount.email, role: safeAccount.role, name: safeAccount.name },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({ success: true, token, user: safeAccount });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user's profile.
 */
router.get('/me', requireAuth, (req, res) => {
  try {
    const account = getAccountById(req.user.id);
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found.' });
    }
    const { passwordHash, ...safe } = account;
    res.json({ success: true, user: safe });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user profile.' });
  }
});

module.exports = router;
