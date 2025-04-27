/**
 * Get the start date of the current week (Monday)
 * @returns {Date} Date object representing start of current week
 */
export function getCurrentWeekStartDate() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday being 0
  
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  
  return monday;
}

/**
 * Get the start date of the current season
 * Seasons are defined as 3-month periods starting in January, April, July, and October
 * @returns {Date} Date object representing start of current season
 */
export function getCurrentSeasonStartDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Determine current season start month (0=Jan, 3=Apr, 6=Jul, 9=Oct)
  const seasonStartMonth = Math.floor(month / 3) * 3;
  
  const seasonStart = new Date(year, seasonStartMonth, 1);
  seasonStart.setHours(0, 0, 0, 0);
  
  return seasonStart;
}

/**
 * Format a date in a human readable format
 * @param {Date} date The date to format
 * @param {Object} options Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    includeTime: false,
    format: 'short' // 'short' or 'long'
  };
  
  const opts = { ...defaultOptions, ...options };
  
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    // Short format: MM/DD/YYYY
    if (opts.format === 'short') {
      const dateString = dateObj.toLocaleDateString('en-US');
      if (!opts.includeTime) return dateString;
      
      const timeString = dateObj.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
      
      return `${dateString} ${timeString}`;
    }
    
    // Long format: Month Day, Year
    if (opts.format === 'long') {
      const dateString = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!opts.includeTime) return dateString;
      
      const timeString = dateObj.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
      
      return `${dateString} at ${timeString}`;
    }
    
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date error';
  }
} 