const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();

const { getAccountByEmail, addAccount, getAccountById } = require('../data/accounts');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';

/**
 * POST /api/auth/register
 * Body: { name, email, phone, password }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

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

    // Check for duplicate in Supabase
    const existing = await getAccountByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create account in Supabase (default role is 'student' unless 'owner' specified)
    const assignedRole = role === 'owner' ? 'owner' : 'student';
    const account = await addAccount({ name, email, phone, passwordHash, role: assignedRole });

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

    const account = await getAccountByEmail(email);
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
 * POST /api/auth/google
 * Body: { credential, role }
 */
router.post('/google', async (req, res) => {
  console.log('\n[AUTH:GOOGLE] ---> Received Google Auth Request');
  try {
    const { credential, role } = req.body;

    if (!credential) {
      console.warn('[AUTH:GOOGLE] Missing credential in request body');
      return res.status(400).json({ success: false, error: 'Google credential is required.' });
    }

    console.log('[AUTH:GOOGLE] Verifying ID token with Google client ID:', process.env.GOOGLE_CLIENT_ID ? 'Configured ✅' : 'MISSING IN .env ❌');

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      console.warn('[AUTH:GOOGLE] Invalid payload extracted from ticket');
      return res.status(400).json({ success: false, error: 'Invalid Google token.' });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || payload.given_name || 'Keja User';
    console.log(`[AUTH:GOOGLE] Verified Google User: ${name} (${email})`);

    // Check if account already exists
    let account = await getAccountByEmail(email);

    if (account) {
      console.log(`[AUTH:GOOGLE] Existing account found for ${email}. Logging in...`);
    } else {
      console.log(`[AUTH:GOOGLE] No account found for ${email}. Creating new account with role: ${role || 'student'}...`);
      const assignedRole = role === 'owner' ? 'owner' : 'student';
      const randomPassword = Math.random().toString(36).slice(-12) + Date.now().toString(36);
      const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);

      account = await addAccount({
        name,
        email,
        phone: '',
        passwordHash,
        role: assignedRole,
      });
      console.log(`[AUTH:GOOGLE] Successfully registered new user ID: ${account.id}`);
    }

    // Issue JWT token
    const token = jwt.sign(
      { id: account.id, email: account.email, role: account.role, name: account.name },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    console.log('[AUTH:GOOGLE] JWT token issued successfully. Sending response.\n');
    res.json({ success: true, token, user: account });
  } catch (error) {
    console.error('[AUTH:GOOGLE] Verification failed error:', error.message || error);
    res.status(401).json({ success: false, error: error.message || 'Google authentication failed.' });
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user's profile.
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const account = await getAccountById(req.user.id);
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
