const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

function generateJwtToken(user) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    avtar: user.avtar
  };

  return jwt.sign(payload, keys.secretkey, {
    expiresIn: '7d',
  });
}

module.exports = generateJwtToken;
