const bcrypt = require('bcryptjs');

/**
 * Hash a sensor secret using bcrypt
 * @param {string} secret - Plain text secret
 * @returns {Promise<string>} Hashed secret
 */
async function hash(secret) {
    const saltRounds = 10;
    return bcrypt.hash(secret, saltRounds);
}

/**
 * Compare a plain text secret with a hashed secret
 * @param {string} secret - Plain text secret
 * @param {string} hash - Hashed secret
 * @returns {Promise<boolean>} True if they match
 */
async function compare(secret, hash) {
    return bcrypt.compare(secret, hash);
}

module.exports = {
    hash,
    compare
};
