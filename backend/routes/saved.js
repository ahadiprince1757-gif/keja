const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { requireAuth } = require('../middleware/auth');
const { formatHouse } = require('../data/houses');

/**
 * GET /api/saved
 * Retrieve all houses saved by the current user from Supabase
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Join saved_houses with houses table
    const { data, error } = await supabase
      .from('saved_houses')
      .select('id, house_id, created_at, houses (*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved houses from Supabase:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    const savedList = (data || [])
      .filter(item => item.houses)
      .map(item => {
        try {
          return {
            savedId: item.id,
            savedAt: item.created_at,
            house: typeof formatHouse === 'function' ? formatHouse(item.houses) : item.houses,
          };
        } catch (e) {
          console.error('Error formatting saved house:', e);
          return null;
        }
      })
      .filter(Boolean);

    res.json({ success: true, saved: savedList });
  } catch (err) {
    console.error('Unexpected error in GET /api/saved:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch saved houses' });
  }
});

/**
 * GET /api/saved/ids
 * Returns an array of house IDs that the current user has saved (for fast heart toggle matching)
 */
router.get('/ids', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('saved_houses')
      .select('house_id')
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    const houseIds = (data || []).map(row => Number(row.house_id));
    res.json({ success: true, houseIds });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch saved house IDs' });
  }
});

/**
 * POST /api/saved/:houseId
 * Save a house to Supabase
 */
router.post('/:houseId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const houseId = parseInt(req.params.houseId, 10);

    if (!houseId || isNaN(houseId)) {
      return res.status(400).json({ success: false, error: 'Valid house ID is required' });
    }

    const { data, error } = await supabase
      .from('saved_houses')
      .upsert(
        { user_id: userId, house_id: houseId },
        { onConflict: 'user_id,house_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error saving house in Supabase:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.status(201).json({ success: true, saved: data });
  } catch (err) {
    console.error('Unexpected error in POST /api/saved/:houseId:', err);
    res.status(500).json({ success: false, error: 'Failed to save house' });
  }
});

/**
 * DELETE /api/saved/:houseId
 * Remove a saved house from Supabase
 */
router.delete('/:houseId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const houseId = parseInt(req.params.houseId, 10);

    if (!houseId || isNaN(houseId)) {
      return res.status(400).json({ success: false, error: 'Valid house ID is required' });
    }

    const { error } = await supabase
      .from('saved_houses')
      .delete()
      .eq('user_id', userId)
      .eq('house_id', houseId);

    if (error) {
      console.error('Error removing saved house from Supabase:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, message: 'House removed from saved items' });
  } catch (err) {
    console.error('Unexpected error in DELETE /api/saved/:houseId:', err);
    res.status(500).json({ success: false, error: 'Failed to remove saved house' });
  }
});

module.exports = router;
