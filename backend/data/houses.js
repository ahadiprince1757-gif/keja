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
    return JSON.parse(data || '[]');
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

// Add new house
function addHouse(houseData) {
  const houses = getAllHouses();
  const newHouse = {
    id: Date.now(),
    title: houseData.title || 'Untitled House',
    area: houseData.area || 'Kahawa Wendani',
    landmark: houseData.landmark || '',
    type: houseData.type || 'Single room',
    rent: Number(houseData.rent) || 3000,
    deposit: Number(houseData.deposit) || Number(houseData.rent) || 3000,
    garbageFee: Number(houseData.garbageFee) || 150,
    distance: houseData.distance || '10 min walk to KU',
    water: houseData.water || 'Borehole on-site',
    electricity: houseData.electricity || 'Tokens prepaid',
    status: houseData.status || 'unverified',
    caretaker: houseData.caretaker || 'Property Caretaker',
    phone: houseData.phone || '+254700000000',
    image: houseData.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    features: Array.isArray(houseData.features) ? houseData.features : ['Borehole Water', 'Tokens'],
    description: houseData.description || 'Newly submitted property.'
  };

  houses.unshift(newHouse);
  saveHouses(houses);
  return newHouse;
}

module.exports = {
  getAllHouses,
  getHouseById,
  addHouse
};
