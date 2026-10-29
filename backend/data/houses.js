const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'houses.json');

// Read all houses
function getAllHouses() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const houses = JSON.parse(data || '[]');
    // Ensure all houses have images array
    return houses.map(h => {
      if (!h.images || !Array.isArray(h.images) || h.images.length === 0) {
        h.images = h.image ? [h.image] : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'];
      }
      return h;
    });
  } catch (error) {
    console.error('Error reading houses data:', error);
    return [];
  }
}

// Save all houses to disk
function saveHouses(houses) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(houses, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving houses data:', error);
    return false;
  }
}

// Find house by ID
function getHouseById(id) {
  const houses = getAllHouses();
  return houses.find(h => h.id === Number(id));
}

// Add new house with multi-image support & detailed specs
function addHouse(houseData) {
  const houses = getAllHouses();

  // Normalize images
  let images = [];
  if (Array.isArray(houseData.images) && houseData.images.length > 0) {
    images = houseData.images.filter(img => typeof img === 'string' && img.trim().length > 0);
  } else if (houseData.image && typeof houseData.image === 'string' && houseData.image.trim()) {
    images = [houseData.image.trim()];
  }

  if (images.length === 0) {
    images = ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'];
  }

  const newHouse = {
    id: Date.now(),
    title: houseData.title ? houseData.title.trim() : 'Modern Student Apartment',
    area: houseData.area || 'Kahawa Wendani',
    landmark: houseData.landmark || '',
    type: houseData.type || 'Bedsitter',
    floor: houseData.floor || '1st Floor',
    vacantUnits: Number(houseData.vacantUnits) || 1,
    rent: Number(houseData.rent) || 4500,
    deposit: Number(houseData.deposit) || Number(houseData.rent) || 4500,
    garbageFee: Number(houseData.garbageFee) || 150,
    distance: houseData.distance || '8 min walk to KU Nyayo Gate',
    water: houseData.water || 'Borehole & County Water (24/7 Supply)',
    electricity: houseData.electricity || 'Prepaid KPLC Token Meter in room',
    wifi: houseData.wifi || 'WiFi Ready / Fibre installed',
    gateCurfew: houseData.gateCurfew || 'Open 24/7 (Resident Key Provided)',
    status: houseData.status || 'verified',
    verifiedDate: new Date().toLocaleDateString('en-KE', { month: 'short', year: 'numeric' }),
    caretaker: houseData.caretaker || 'Resident Caretaker',
    phone: houseData.phone || '+254712345678',
    whatsapp: houseData.whatsapp || houseData.phone || '+254712345678',
    image: images[0],
    images: images,
    features: Array.isArray(houseData.features) && houseData.features.length > 0
      ? houseData.features
      : ['Borehole Water', 'Token Meter', 'Tiled Floor', 'Instant Hot Shower'],
    rules: Array.isArray(houseData.rules)
      ? houseData.rules
      : ['No loud music after 10 PM', 'Guests permitted with notification', 'Prompt rent payment by 5th'],
    description: houseData.description || 'Spacious, well-ventilated student housing with reliable water supply and security.',
    ownerId: houseData.ownerId || null
  };

  houses.unshift(newHouse);
  saveHouses(houses);
  return newHouse;
}

/**
 * Update an existing house by ID (partial update).
 * @param {number|string} id
 * @param {Object} updates
 * @returns {Object|null}
 */
function updateHouse(id, updates) {
  const houses = getAllHouses();
  const idx = houses.findIndex(h => h.id === Number(id));
  if (idx === -1) return null;

  // Merge update but never override id
  const { id: _id, ownerId: _ownerId, ...safeUpdates } = updates;
  houses[idx] = { ...houses[idx], ...safeUpdates };
  saveHouses(houses);
  return houses[idx];
}

/**
 * Delete a house by ID.
 * @param {number|string} id
 * @returns {boolean}
 */
function deleteHouse(id) {
  const houses = getAllHouses();
  const idx = houses.findIndex(h => h.id === Number(id));
  if (idx === -1) return false;
  houses.splice(idx, 1);
  return saveHouses(houses);
}

module.exports = {
  getAllHouses,
  getHouseById,
  addHouse,
  updateHouse,
  deleteHouse
};
