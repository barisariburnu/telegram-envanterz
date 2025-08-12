/**
 * Authentication module for the Telegram bot
 * Handles user authorization based on Telegram user IDs
 */

/**
 * Check if a user is authorized to use the bot
 * @param {number} userId - Telegram user ID
 * @returns {boolean} - Whether the user is authorized
 */
function isAuthorized(userId) {
  // Get authorized users from environment variable
  const authorizedUsers = process.env.AUTHORIZED_USERS || '';
  
  // Convert to array of numbers
  const authorizedUserIds = authorizedUsers
    .split(',')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id));
  
  // Check if user ID is in the authorized list
  return authorizedUserIds.includes(userId);
}

module.exports = {
  isAuthorized
};