const jwt = require('jsonwebtoken');

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret', {
    expiresIn: '30d',
  });
};

module.exports = generateRefreshToken;
