const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kejaku_secret_dev_2026';

/**
 * Middleware: verify Bearer JWT and attach req.user
 * Returns 401 if missing/invalid, 403 if expired.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, name }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ success: false, error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
}

/**
 * Middleware: require one or more specific roles (e.g. 'super_admin')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Access denied: Insufficient privileges.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole, JWT_SECRET };
