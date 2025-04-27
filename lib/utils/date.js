/**
 * Utility functions for handling dates related to seasons and weeks
 */

// Season settings - modify these for your guild schedule
const SEASON_START_DATE = new Date('2023-01-01');
const SEASON_DURATION_WEEKS = 13; // ~3 months per season

/**
 * Get the current season ID based on the current date
 * @returns {string} Current season ID (e.g., 'season-3')
 */
export function getCurrentSeason() {
  const now = new Date();
  const diffTime = Math.abs(now - SEASON_START_DATE);
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  
  const seasonNumber = Math.floor(diffWeeks / SEASON_DURATION_WEEKS) + 1;
  return `season-${seasonNumber}`;
}

/**
 * Get the current week number for the current season
 * @returns {number} Week number within the current season (1-indexed)
 */
export function getCurrentWeek() {
  const now = new Date();
  const diffTime = Math.abs(now - SEASON_START_DATE);
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  
  // Get week number within the current season (1-indexed)
  return ((diffWeeks - 1) % SEASON_DURATION_WEEKS) + 1;
}

/**
 * Get the start and end dates for a specific week in a season
 * @param {number} weekNumber - Week number (1-indexed)
 * @param {string} seasonId - Season ID (e.g., 'season-3')
 * @returns {Object} Object containing start and end dates for the week
 */
export function getWeekDates(weekNumber, seasonId) {
  // Parse season number from seasonId
  const seasonNumber = parseInt(seasonId.split('-')[1], 10);
  
  // Calculate start date for the season
  const seasonStartDate = new Date(SEASON_START_DATE);
  seasonStartDate.setDate(
    seasonStartDate.getDate() + (seasonNumber - 1) * SEASON_DURATION_WEEKS * 7
  );
  
  // Calculate start and end dates for the week
  const weekStartDate = new Date(seasonStartDate);
  weekStartDate.setDate(weekStartDate.getDate() + (weekNumber - 1) * 7);
  
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  
  return {
    start: weekStartDate,
    end: weekEndDate
  };
}

/**
 * Format a date as a readable string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Calculate the weeks remaining in the current season
 * @returns {number} Number of weeks remaining
 */
export function getWeeksRemainingInSeason() {
  const currentWeek = getCurrentWeek();
  return SEASON_DURATION_WEEKS - currentWeek + 1;
} 