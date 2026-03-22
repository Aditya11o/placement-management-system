const User = require('../models/User');
const Profile = require('../models/Profile');
const generateToken = require('../utils/generateToken');
const generateRefreshToken = require('../utils/generateRefreshToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailUtils');
const { validateEmailDomain } = require('../utils/domainValidator');

// Helper to set tokens as cookies
const setTokenCookies = (res, user) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('token', token, { ...cookieOptions, maxAge: 1 * 24 * 60 * 60 * 1000 }); // 1 day
  res.cookie('refreshToken', refreshToken, cookieOptions);

  return { token, refreshToken };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Domain Validation (Defense-in-depth)
  const { isValid, message } = validateEmailDomain(email, role);
  if (!isValid) {
    return res.status(400).json({ message });
  }

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
      status: role === 'recruiter' ? 'pending' : 'active',
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
      } else if (user.role === 'recruiter') {
        try {
          await sendEmail({
            email: user.email,
            subject: 'Recruiter Account Pending Approval',
            message: `<h1>Welcome ${user.name}!</h1><p>Your recruiter account has been created and is currently pending administrator approval. You will be notified once your account is active.</p>`,
          });
        } catch (err) {
          console.error('Email failed to send:', err);
        }
      }

      const { token, refreshToken } = setTokenCookies(res, user);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token,
        refreshToken,
      });
    } else {
      res.status(400);
      res.json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      res.status(401);
      return res.json({ message: 'Invalid email or password' });
    }

    // Check account status
    if (user.status === 'pending') {
      res.status(403);
      return res.json({ message: 'Your account is pending administrator approval.' });
    }

    if (user.status === 'blacklisted') {
      res.status(403);
      return res.json({ message: 'Your account has been blacklisted.' });
    }

    if (user.status === 'inactive') {
      res.status(403);
      return res.json({ message: 'Your account is inactive.' });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      res.status(401);
      return res.json({ message: 'Account is temporarily locked. Please try again later.' });
    }

    if (await user.matchPassword(password)) {
      // Reset login attempts on success
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

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

      const { token, refreshToken } = setTokenCookies(res, user);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
        refreshToken,
      });
    } else {
      // Increment login attempts on failure
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
      }
      await user.save();

      res.status(401);
      res.json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

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
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid Refresh Token' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res, next) => {
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
    user.loginAttempts = 0; // Reset on successful 2FA as well
    user.lockUntil = undefined;
    await user.save();

    const { token, refreshToken } = setTokenCookies(res, user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookies
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { registerUser, authUser, refreshAccessToken, verifyOTP, logoutUser };
