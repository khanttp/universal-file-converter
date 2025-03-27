/**
 * Sanitize a file name by removing unsafe characters.
 * This ensures that only alphanumeric characters, dashes, underscores, dots, and spaces remain.
 *
 * @param {string} name - The original file name.
 * @returns {string} The sanitized file name.
 */
const sanitizeFileName = (name) => {
  return name.replace(/[^a-z0-9.\-_ ]/gi, '_');
};

export default sanitizeFileName;
