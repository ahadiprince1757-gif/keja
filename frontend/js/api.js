/**
 * Frontend API Service
 * Interacts with KejaKU Backend REST API
 * Automatically falls back to offline/local mode if backend is not running
 */

// On Render or any web server, use relative path '/api'. Fallback to localhost if file://
const API_BASE = window.location.protocol.startsWith('http')
  ? '/api'
  : 'http://localhost:5000/api';

export async function fetchHousesFromApi(queryParams = {}) {
  try {
    const params = new URLSearchParams();
    if (queryParams.keyword) params.append('keyword', queryParams.keyword);
    if (queryParams.area) params.append('area', queryParams.area);
    if (queryParams.type) params.append('type', queryParams.type);
    if (queryParams.maxRent) params.append('maxRent', queryParams.maxRent);
    if (queryParams.verifiedOnly) params.append('verifiedOnly', 'true');
    if (queryParams.sortBy) params.append('sortBy', queryParams.sortBy);

    const url = `${API_BASE}/houses?${params.toString()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) throw new Error('API response was not ok');
    const result = await response.json();
    return result.data || null;
  } catch (err) {
    // Graceful offline fallback
    return null;
  }
}

export async function postNewHouseToApi(houseData) {
  try {
    const response = await fetch(`${API_BASE}/houses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(houseData)
    });
    if (!response.ok) throw new Error('Failed to create listing on backend');
    return await response.json();
  } catch (err) {
    console.warn('Backend unavailable, listing stored locally:', err);
    return { success: true, localOnly: true, data: houseData };
  }
}

export async function postEnquiryToApi(enquiryData) {
  try {
    const response = await fetch(`${API_BASE}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiryData)
    });
    return await response.json();
  } catch (err) {
    return { success: true, localOnly: true, data: enquiryData };
  }
}
