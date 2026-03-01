const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

/**
 * Generates a new 2FA secret and the corresponding QR code URL.
 * @param {string} email - The email of the user (used for the auth app label).
 * @returns {Promise<{ secret: string, qrCodeUrl: string }>}
 */
exports.generate2FASecret = async (email) => {
    const secret = speakeasy.generateSecret({
        name: `PMS Placement Cell (${email})`
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
        secret: secret.base32,
        qrCodeUrl
    };
};

/**
 * Verifies a 2FA token against a user's secret.
 * @param {string} secret - The user's saved base32 secret.
 * @param {string} token - The 6-digit code provided by the user.
 * @returns {boolean} True if the token is valid, false otherwise.
 */
exports.verify2FAToken = (secret, token) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1 // Allow 1 step (30 seconds) tolerance for clock drift
    });
};
