const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.user_type },
    process.env.JWT_SECRET || 'default_secret_key_change_me',
    { expiresIn: '24h' }
  );
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken
};
