const supabase = require('../supabase');

/**
 * Format database record (snake_case) to application object (camelCase)
 */
function formatAccount(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    phone: row.phone,
    role: row.role || 'owner',
    houseIds: row.house_ids || [],
    avatar: row.avatar || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Find an account by email (case-insensitive)
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
async function getAccountByEmail(email) {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .ilike('email', email.trim())
      .maybeSingle();

    if (error) {
      console.error('Error fetching account by email:', error.message);
      return null;
    }
    return formatAccount(data);
  } catch (err) {
    console.error('getAccountByEmail unexpected error:', err);
    return null;
  }
}

/**
 * Find an account by ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
async function getAccountById(id) {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching account by id:', error.message);
      return null;
    }
    return formatAccount(data);
  } catch (err) {
    console.error('getAccountById unexpected error:', err);
    return null;
  }
}

/**
 * Create a new account in Supabase
 * @param {Object} data - { name, email, passwordHash, phone }
 * @returns {Promise<Object>} created account (without passwordHash)
 */
async function addAccount(data) {
  const id = `acc_${Date.now()}`;
  const insertPayload = {
    id,
    name: (data.name || '').trim(),
    email: data.email.toLowerCase().trim(),
    password_hash: data.passwordHash,
    phone: (data.phone || '').trim(),
    role: data.role || 'student',
    house_ids: [],
    avatar: null,
  };

  const { data: created, error } = await supabase
    .from('accounts')
    .insert([insertPayload])
    .select()
    .single();

  if (error) {
    console.error('Error adding account to Supabase:', error.message);
    throw new Error(error.message);
  }

  const formatted = formatAccount(created);
  const { passwordHash, ...safe } = formatted;
  return safe;
}

/**
 * Update an account's fields
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<Object|null>} updated safe account or null
 */
async function updateAccount(id, updates) {
  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name.trim();
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone.trim();
  if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
  if (updates.houseIds !== undefined) dbUpdates.house_ids = updates.houseIds;
  dbUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('accounts')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating account in Supabase:', error.message);
    return null;
  }

  const formatted = formatAccount(data);
  const { passwordHash, ...safe } = formatted;
  return safe;
}

module.exports = {
  getAccountByEmail,
  getAccountById,
  addAccount,
  updateAccount,
};
