const express = require('express');
const router = express.Router();
const { getAllHouses, getHouseById, addHouse } = require('../data/houses');

/**
 * GET /api/houses
 * Query params: keyword, area, type, maxRent, minRent, verifiedOnly, sortBy
 */
router.get('/', async (req, res) => {
  try {
    let houses = await getAllHouses();
    const { keyword, area, type, maxRent, minRent, verifiedOnly, sortBy } = req.query;

    // Filter by keyword
    if (keyword && keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      houses = houses.filter(h =>
        h.title.toLowerCase().includes(q) ||
        h.area.toLowerCase().includes(q) ||
        (h.landmark || '').toLowerCase().includes(q) ||
        h.type.toLowerCase().includes(q) ||
        (h.description || '').toLowerCase().includes(q) ||
        (h.features || []).some(f => f.toLowerCase().includes(q))
      );
    }

    // Filter by Area
    if (area && area.trim()) {
      houses = houses.filter(h => h.area.toLowerCase() === area.trim().toLowerCase());
    }

    // Filter by Room Type
    if (type && type.trim()) {
      houses = houses.filter(h => h.type.toLowerCase() === type.trim().toLowerCase());
    }

    // Filter by Rent range
    if (minRent) {
      houses = houses.filter(h => h.rent >= Number(minRent));
    }
    if (maxRent) {
      houses = houses.filter(h => h.rent <= Number(maxRent));
    }

    // Filter verified only
    if (verifiedOnly === 'true' || verifiedOnly === true) {
      houses = houses.filter(h => h.status === 'visited');
    }

    // Sorting
    if (sortBy === 'low') {
      houses.sort((a, b) => a.rent - b.rent);
    } else if (sortBy === 'high') {
      houses.sort((a, b) => b.rent - a.rent);
    } else if (sortBy === 'proximity') {
      const priority = { 'Near KU main gate': 1, 'Kahawa Wendani': 2, 'Kahawa Sukari': 3, 'Ruiru': 4 };
      houses.sort((a, b) => (priority[a.area] || 99) - (priority[b.area] || 99));
    }

    res.json({
      success: true,
      count: houses.length,
      data: houses
    });
  } catch (error) {
    console.error('Error fetching houses:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching houses' });
  }
});

/**
 * GET /api/houses/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const house = await getHouseById(req.params.id);
    if (!house) {
      return res.status(404).json({ success: false, error: 'House listing not found' });
    }
    res.json({ success: true, data: house });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/houses
 * Create a new house listing
 */
router.post('/', async (req, res) => {
  try {
    const { title, area, type, rent } = req.body;
    if (!title || !area || !type || !rent) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, area, type, and rent are mandatory'
      });
    }

    const created = await addHouse(req.body);
    res.status(201).json({
      success: true,
      message: 'House added successfully',
      data: created
    });
  } catch (error) {
    console.error('Error creating house listing:', error);
    res.status(500).json({ success: false, error: 'Could not add house' });
  }
});

module.exports = router;
