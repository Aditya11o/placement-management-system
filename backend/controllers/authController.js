const User = require('../models/User');
const Profile = require('../models/Profile');
const generateToken = require('../utils/generateToken');
const generateRefreshToken = require('../utils/generateRefreshToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailUtils');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      return res.json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      // Create empty profile for the user
      await Profile.create({ user: user._id });

      if (user.role === 'student') {
        try {
          await sendEmail({
            email: user.email,
            subject: 'Welcome to Placement Management System',
            message: `<h1>Welcome ${user.name}!</h1><p>Your account has been created successfully. Please complete your profile to start applying for jobs.</p>`,
          });
        } catch (err) {
          console.error('Email failed to send:', err);
        }
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        refreshToken: generateRefreshToken(user._id),
      });
    } else {
      res.status(400);
      res.json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Check if 2FA is required (Admin or Recruiter)
      if (user.role === 'admin' || user.role === 'recruiter') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        try {
          await sendEmail({
            email: user.email,
            subject: 'Your 2FA Login Code',
            message: `<h1>Security Verification</h1><p>Your login OTP is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
          });
          return res.json({ requireOTP: true, email: user.email });
        } catch (err) {
          console.error('2FA Email failed:', err);
          return res.status(500).json({ message: 'Failed to send verification code' });
        }
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        refreshToken: generateRefreshToken(user._id),
      });
    } else {
      res.status(401);
      res.json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh Token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid Refresh Token' });
    }

    const accessToken = generateToken(user._id);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid Refresh Token' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ 
      email, 
      otp, 
      otpExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP after successful use
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, authUser, refreshAccessToken, verifyOTP };
