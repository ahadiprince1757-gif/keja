const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'accounts.json');

/**
 * Ensure the accounts JSON file exists with an empty array.
 */
function ensureFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
  }
}

/**
 * Read all accounts from disk.
 * @returns {Array}
 */
function getAllAccounts() {
  try {
    ensureFile();
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading accounts data:', error);
    return [];
  }
}

/**
 * Persist all accounts to disk.
 * @param {Array} accounts
 */
function saveAccounts(accounts) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(accounts, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving accounts data:', error);
    return false;
  }
}

/**
 * Find an account by email (case-insensitive).
 * @param {string} email
 * @returns {Object|undefined}
 */
function getAccountByEmail(email) {
  const accounts = getAllAccounts();
  return accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
}

/**
 * Find an account by ID.
 * @param {string} id
 * @returns {Object|undefined}
 */
function getAccountById(id) {
  const accounts = getAllAccounts();
  return accounts.find(a => a.id === id);
}

/**
 * Create a new account.
 * @param {Object} data - { name, email, passwordHash, phone }
 * @returns {Object} created account (without passwordHash)
 */
function addAccount(data) {
  const accounts = getAllAccounts();

  const newAccount = {
    id: `acc_${Date.now()}`,
    name: (data.name || '').trim(),
    email: data.email.toLowerCase().trim(),
    passwordHash: data.passwordHash,
    phone: (data.phone || '').trim(),
    role: 'owner',
    houseIds: [],
    avatar: null,
    createdAt: new Date().toISOString(),
  };

  accounts.push(newAccount);
  saveAccounts(accounts);

  // Return safe version (no passwordHash)
  const { passwordHash, ...safe } = newAccount;
  return safe;
}

/**
 * Update an account's fields (partial update).
 * @param {string} id
 * @param {Object} updates
 * @returns {Object|null} updated safe account or null
 */
function updateAccount(id, updates) {
  const accounts = getAllAccounts();
  const idx = accounts.findIndex(a => a.id === id);
  if (idx === -1) return null;

  // Never allow overwriting id or passwordHash through this function
  const { id: _id, passwordHash: _ph, ...safeUpdates } = updates;
  accounts[idx] = { ...accounts[idx], ...safeUpdates };
  saveAccounts(accounts);

  const { passwordHash, ...safe } = accounts[idx];
  return safe;
}

module.exports = {
  getAllAccounts,
  getAccountByEmail,
  getAccountById,
  addAccount,
  updateAccount,
};
