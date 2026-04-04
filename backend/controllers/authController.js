const User = require('../models/User');
const crypto = require('crypto');
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
const registerUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Domain Validation (Defense-in-depth)
  const { isValid, message } = validateEmailDomain(email, role);
  if (!isValid) {
    return res.status(400).json({ message });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
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
            template: 'welcome',
            context: {
              name: user.name,
              role: 'student',
              loginUrl: `http://localhost:5173/login`
            }
          });
        } catch (err) {
          console.error('Email failed to send:', err);
        }
      } else if (user.role === 'recruiter') {
        try {
          await sendEmail({
            email: user.email,
            subject: 'Recruiter Account Pending Approval',
            template: 'welcome',
            context: {
              name: user.name,
              role: 'recruiter',
              loginUrl: `http://localhost:5173/login`
            }
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
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(401).json({ 
        message: 'Account is locked. Please try again after 15 minutes or reset your password.' 
      });
    }

    if (await user.matchPassword(password)) {
      // Reset login attempts on success
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      // Check if 2FA is needed (for Admin and Mentors)
      if (user.role === 'admin' || user.role === 'mentor') {
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        // Send OTP Email
        try {
          await sendEmail({
            email: user.email,
            subject: 'Your 2FA Login Code',
            template: 'otp',
            context: {
              name: user.name,
              otp: otp,
              expiryTime: '10 minutes'
            }
          });
        } catch (err) {
          console.error('OTP Email Error:', err);
        }

        return res.json({ 
          requireOTP: true, 
          email: user.email,
          message: 'OTP sent to your institutional email' 
        });
      }

      const { token, refreshToken } = setTokenCookies(res, user);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token,
        refreshToken,
      });
    } else {
      // Increment login attempts
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 min lock
      }
      await user.save();
      
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP for 2FA
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email }).select('+otp +otpExpires');

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const { token, refreshToken } = setTokenCookies(res, user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public (via Refresh Cookie)
const refreshAccessToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid user' });
    }

    const accessToken = generateToken(user._id);
    
    // Optional: Rotate refresh token here
    
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Hash and set to reset_token field
    user.reset_token = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiry
    user.reset_token_expiry = Date.now() + 15 * 60 * 1000; // 15 mins

    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        template: 'password-reset',
        context: {
          name: user.name,
          resetUrl: resetUrl
        }
      });
      res.json({ message: 'Reset link sent to your email' });
    } catch (err) {
      console.error('SMTP Error:', err);
      user.reset_token = undefined;
      user.reset_token_expiry = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent. Please check SMTP settings.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      reset_token: hashedToken,
      reset_token_expiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.reset_token = undefined;
    user.reset_token_expiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Password (Logged In)
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res, next) => {
  const { current_password, new_password } = req.body;

  try {
    const user = await User.findById(req.user.id).select('+password');
    
    if (!(await user.matchPassword(current_password))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = new_password;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate account
// @route   DELETE /api/auth/deactivate
// @access  Private
const deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.status = 'inactive';
    await user.save();
    
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.json({ message: 'Account deactivated' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  authUser,
  verifyOTP,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  updatePassword,
  deactivateAccount
};
