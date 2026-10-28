/**
 * Saved Houses / Bookmarking Management Component
 */

import { showToast } from './toast.js';

const STORAGE_KEY = 'kejaku_saved_houses_v2';

let savedSet = new Set(
  JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
);

export function getSavedIds() {
  return savedSet;
}

export function isSaved(id) {
  return savedSet.has(Number(id));
}

export function toggleSaveHouse(id, houseTitle = 'House') {
  const numId = Number(id);
  const had = savedSet.has(numId);

  if (had) {
    savedSet.delete(numId);
    showToast(`Removed "${houseTitle}" from saved houses.`);
  } else {
    savedSet.add(numId);
    showToast(`Saved "${houseTitle}" to your list!`);
  }

  // Persist
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedSet]));
  updateSavedBadgeCount();

  // Return new state
  return !had;
}

export function updateSavedBadgeCount() {
  const pill = document.getElementById('savedCountPill');
  if (pill) {
    pill.textContent = savedSet.size;
  }
}
