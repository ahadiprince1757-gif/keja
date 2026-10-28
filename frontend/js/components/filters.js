/**
 * Filter and Search Component
 * Manages filtering, searching, and sorting criteria
 */

import { getSavedIds } from './saved.js';

export function filterHouses(houses, filters = {}) {
  const {
    keyword = '',
    area = '',
    type = '',
    maxRent = Infinity,
    minRent = 0,
    verifiedOnly = false,
    savedOnly = false,
    sortBy = 'recommended'
  } = filters;

  const savedIds = getSavedIds();
  const searchLower = keyword.trim().toLowerCase();

  let filtered = houses.filter(house => {
    // Search keyword match
    if (searchLower) {
      const matchTitle = house.title.toLowerCase().includes(searchLower);
      const matchArea = house.area.toLowerCase().includes(searchLower);
      const matchLandmark = (house.landmark || '').toLowerCase().includes(searchLower);
      const matchDesc = (house.description || '').toLowerCase().includes(searchLower);
      const matchType = house.type.toLowerCase().includes(searchLower);
      const matchFeatures = (house.features || []).some(f => f.toLowerCase().includes(searchLower));

      if (!matchTitle && !matchArea && !matchLandmark && !matchDesc && !matchType && !matchFeatures) {
        return false;
      }
    }

    // Area match
    if (area && house.area !== area) {
      return false;
    }

    // Room Type match
    if (type && house.type !== type) {
      return false;
    }

    // Rent range match
    if (house.rent > maxRent || house.rent < minRent) {
      return false;
    }

    // Verified only filter
    if (verifiedOnly && house.status !== 'visited') {
      return false;
    }

    // Saved houses only mode
    if (savedOnly && !savedIds.has(house.id)) {
      return false;
    }

    return true;
  });

  // Sorting
  if (sortBy === 'low') {
    filtered.sort((a, b) => a.rent - b.rent);
  } else if (sortBy === 'high') {
    filtered.sort((a, b) => b.rent - a.rent);
  } else if (sortBy === 'proximity') {
    // Proximity priority (e.g. Near KU main gate, Kahawa Wendani first)
    const priority = { 'Near KU main gate': 1, 'Kahawa Wendani': 2, 'Kahawa Sukari': 3, 'Ruiru': 4 };
    filtered.sort((a, b) => (priority[a.area] || 99) - (priority[b.area] || 99));
  }

  return filtered;
}
