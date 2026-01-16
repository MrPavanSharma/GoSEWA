const { User } = require('../models');
const { hashPassword, comparePassword, generateToken } = require('../utils/authUtils');

exports.register = async (req, res) => {
  try {
    const { email, password, phone, user_type, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Check if phone exists
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Contact number already in use' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      email,
      password_hash: hashedPassword,
      phone,
      user_type,
      full_name: name
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          user_type: user.user_type
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          user_type: user.user_type
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google Token
    const axios = require('axios');
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const { email, name, sub } = response.data;

    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Create new user if not exists
      // Using 'google_auth_placeholder' for password since they login via Google
      const hashedPassword = await hashPassword(require('crypto').randomBytes(16).toString('hex'));
      
      user = await User.create({
        email,
        password_hash: hashedPassword,
        full_name: name,
        user_type: 'ENTREPRENEUR', // Default role
        google_id: sub
      });
    }

    const jwtToken = generateToken(user);

    res.json({
      success: true,
      message: 'Google login successful',
      data: {
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          user_type: user.user_type,
          full_name: user ? user.full_name : name // handle potential null
        }
      }
    });
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(401).json({ success: false, message: 'Invalid Google Token' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
