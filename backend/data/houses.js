const supabase = require('../supabase');

/**
 * Format DB row (snake_case) to application object (camelCase)
 */
function formatHouse(row) {
  if (!row) return null;
  const images = Array.isArray(row.images) && row.images.length > 0
    ? row.images
    : (row.image ? [row.image] : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80']);

  return {
    id: row.id,
    title: row.title,
    area: row.area,
    landmark: row.landmark || '',
    type: row.type,
    floor: row.floor || '1st Floor',
    vacantUnits: row.vacant_units ?? 1,
    rent: Number(row.rent),
    deposit: Number(row.deposit ?? row.rent),
    garbageFee: Number(row.garbage_fee ?? 0),
    distance: row.distance || '',
    water: row.water || '',
    electricity: row.electricity || '',
    wifi: row.wifi || '',
    gateCurfew: row.gate_curfew || '',
    status: row.status || 'visited',
    verifiedDate: row.verified_date || 'Oct 2026',
    caretaker: row.caretaker || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || row.phone || '',
    image: images[0],
    images: images,
    features: Array.isArray(row.features) ? row.features : [],
    rules: Array.isArray(row.rules) ? row.rules : [],
    description: row.description || '',
    ownerId: row.owner_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Upload an image (base64 string or binary) directly to Supabase Storage bucket 'houses'
 * @param {string} dataUrl - e.g. "data:image/jpeg;base64,..." or URL
 * @returns {Promise<string>} public CDN URL
 */
async function uploadToSupabaseStorage(dataUrl) {
  // If already an HTTP/HTTPS URL, no upload needed
  if (!dataUrl || typeof dataUrl !== 'string') return dataUrl;
  if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    return dataUrl;
  }

  // Handle base64 data URLs
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return dataUrl;
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  const extension = mimeType.split('/')[1] || 'jpg';
  const fileName = `house_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
  const filePath = `uploads/${fileName}`;

  const { data, error } = await supabase.storage
    .from('houses')
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    console.error('Supabase Storage upload error:', error.message);
    // If upload fails, fallback to keeping existing URL
    return dataUrl;
  }

  const { data: urlData } = supabase.storage
    .from('houses')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Fetch all houses from Supabase
 */
async function getAllHouses() {
  try {
    const { data, error } = await supabase
      .from('houses')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching houses from Supabase:', error.message);
      return [];
    }
    return (data || []).map(formatHouse);
  } catch (err) {
    console.error('getAllHouses error:', err);
    return [];
  }
}

/**
 * Fetch single house by ID
 */
async function getHouseById(id) {
  try {
    const { data, error } = await supabase
      .from('houses')
      .select('*')
      .eq('id', Number(id))
      .maybeSingle();

    if (error) {
      console.error('Error fetching house by id:', error.message);
      return null;
    }
    return formatHouse(data);
  } catch (err) {
    console.error('getHouseById error:', err);
    return null;
  }
}

/**
 * Insert a new house into Supabase (uploading photos to Supabase Storage first)
 */
async function addHouse(houseData) {
  // Normalize and upload images to Supabase Storage
  let rawImages = [];
  if (Array.isArray(houseData.images) && houseData.images.length > 0) {
    rawImages = houseData.images.filter(img => typeof img === 'string' && img.trim());
  } else if (houseData.image && typeof houseData.image === 'string' && houseData.image.trim()) {
    rawImages = [houseData.image.trim()];
  }

  // Upload each image if it's base64
  const uploadedUrls = [];
  for (const img of rawImages) {
    const publicUrl = await uploadToSupabaseStorage(img);
    uploadedUrls.push(publicUrl);
  }

  if (uploadedUrls.length === 0) {
    uploadedUrls.push('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80');
  }

  const payload = {
    title: houseData.title ? houseData.title.trim() : 'Modern Student Apartment',
    area: houseData.area || 'Kahawa Wendani',
    landmark: houseData.landmark || '',
    type: houseData.type || 'Bedsitter',
    floor: houseData.floor || '1st Floor',
    vacant_units: Number(houseData.vacantUnits) || 1,
    rent: Number(houseData.rent) || 4500,
    deposit: Number(houseData.deposit) || Number(houseData.rent) || 4500,
    garbage_fee: Number(houseData.garbageFee) || 150,
    distance: houseData.distance || '8 min walk to KU Nyayo Gate',
    water: houseData.water || 'Borehole & County Water (24/7 Supply)',
    electricity: houseData.electricity || 'Prepaid KPLC Token Meter in room',
    wifi: houseData.wifi || 'WiFi Ready / Fibre installed',
    gate_curfew: houseData.gateCurfew || 'Open 24/7 (Resident Key Provided)',
    status: houseData.status || 'visited',
    verified_date: new Date().toLocaleDateString('en-KE', { month: 'short', year: 'numeric' }),
    caretaker: houseData.caretaker || 'Resident Caretaker',
    phone: houseData.phone || '+254712345678',
    whatsapp: houseData.whatsapp || houseData.phone || '+254712345678',
    image: uploadedUrls[0],
    images: uploadedUrls,
    features: Array.isArray(houseData.features) ? houseData.features : [],
    rules: Array.isArray(houseData.rules) ? houseData.rules : [],
    description: houseData.description || 'Spacious student housing near KU.',
    owner_id: houseData.ownerId || null,
  };

  const { data, error } = await supabase
    .from('houses')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error inserting house into Supabase:', error.message);
    throw new Error(error.message);
  }

  return formatHouse(data);
}

/**
 * Update a house in Supabase
 */
async function updateHouse(id, updates) {
  // If images are updated and contain base64, upload them
  let uploadedUrls = undefined;
  if (Array.isArray(updates.images)) {
    uploadedUrls = [];
    for (const img of updates.images) {
      const publicUrl = await uploadToSupabaseStorage(img);
      uploadedUrls.push(publicUrl);
    }
  }

  const payload = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.area !== undefined) payload.area = updates.area;
  if (updates.landmark !== undefined) payload.landmark = updates.landmark;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.floor !== undefined) payload.floor = updates.floor;
  if (updates.vacantUnits !== undefined) payload.vacant_units = Number(updates.vacantUnits);
  if (updates.rent !== undefined) payload.rent = Number(updates.rent);
  if (updates.deposit !== undefined) payload.deposit = Number(updates.deposit);
  if (updates.garbageFee !== undefined) payload.garbage_fee = Number(updates.garbageFee);
  if (updates.distance !== undefined) payload.distance = updates.distance;
  if (updates.water !== undefined) payload.water = updates.water;
  if (updates.electricity !== undefined) payload.electricity = updates.electricity;
  if (updates.wifi !== undefined) payload.wifi = updates.wifi;
  if (updates.gateCurfew !== undefined) payload.gate_curfew = updates.gateCurfew;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.caretaker !== undefined) payload.caretaker = updates.caretaker;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.whatsapp !== undefined) payload.whatsapp = updates.whatsapp;
  if (uploadedUrls) {
    payload.images = uploadedUrls;
    payload.image = uploadedUrls[0];
  }
  if (updates.features !== undefined) payload.features = updates.features;
  if (updates.rules !== undefined) payload.rules = updates.rules;
  if (updates.description !== undefined) payload.description = updates.description;
  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('houses')
    .update(payload)
    .eq('id', Number(id))
    .select()
    .single();

  if (error) {
    console.error('Error updating house in Supabase:', error.message);
    return null;
  }

  return formatHouse(data);
}

/**
 * Delete a house from Supabase
 */
async function deleteHouse(id) {
  const { error } = await supabase
    .from('houses')
    .delete()
    .eq('id', Number(id));

  if (error) {
    console.error('Error deleting house from Supabase:', error.message);
    return false;
  }
  return true;
}

module.exports = {
  getAllHouses,
  getHouseById,
  addHouse,
  updateHouse,
  deleteHouse,
  uploadToSupabaseStorage,
};
