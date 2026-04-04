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
      return res.status(400).json({ message: 'Invalid user data' });
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
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check account status
    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Your account is pending administrator approval.' });
    }

    if (user.status === 'blacklisted') {
      return res.status(403).json({ message: 'Your account has been blacklisted.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account is inactive.' });
    }



    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(401).json({ message: 'Account is temporarily locked. Please try again later.' });
    }

    if (await user.matchPassword(password)) {
      // Check if 2FA is required (Admin or Recruiter)
      if (user.role === 'admin' || user.role === 'recruiter') {
        // Do NOT reset loginAttempts here — only after OTP is verified
        const otp = crypto.randomInt(100000, 999999).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        try {
          await sendEmail({
            email: user.email,
            subject: 'Your 2FA Login Code',
            template: 'otp',
            context: {
              name: user.name,
              otp: otp
            }
          });
          return res.json({ requireOTP: true, email: user.email });
        } catch (err) {
          console.error('2FA Email failed:', err);
          return res.status(500).json({ message: 'Failed to send verification code' });
        }
      }

      // For non-2FA roles (students), reset login attempts on password success
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      const { token, refreshToken } = setTokenCookies(res, user);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
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

      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh Token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
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
    // First, find the user to check lockout status
    const user = await User.findOne({ email }).select('+otp +otpExpires +loginAttempts +lockUntil');

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }



    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(401).json({ message: 'Account is temporarily locked. Please try again later.' });
    }

    // Verify OTP and expiry
    const isTestAccount = process.env.NODE_ENV === 'development' && process.env.TEST_OTP_BYPASS_EMAIL && email === process.env.TEST_OTP_BYPASS_EMAIL;
    if (!isTestAccount && (!user.otp || user.otp !== otp || !user.otpExpires || user.otpExpires < Date.now())) {
      // Increment login attempts on failed OTP
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // OTP verified — clear OTP and reset lockout
    user.otp = undefined;
    user.otpExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const { token, refreshToken } = setTokenCookies(res, user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
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
const logoutUser = async (req, res, next) => {
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
    // Hash the token sent in the link
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      reset_token: hashedToken,
      reset_token_expiry: { $gt: Date.now() }
    }).select('+reset_token +reset_token_expiry');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = password;
    user.reset_token = undefined;
    user.reset_token_expiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate Account
// @route   DELETE /api/auth/deactivate
// @access  Private
const deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Set to inactive (admin can reactivate later)
    user.status = 'inactive';
    await user.save();

    // Logout
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.json({ success: true, message: 'Account deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  authUser,
  refreshAccessToken,
  verifyOTP,
  logoutUser,
  forgotPassword,
  resetPassword,
  updatePassword,
  deactivateAccount
};
