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
            message: `<h1>Security Verification</h1><p>Your login OTP is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
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
    if (!user.otp || user.otp !== otp || !user.otpExpires || user.otpExpires < Date.now()) {
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

    // Send email
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    const message = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
        <h2 style="color: #1e1b4b; text-align: center;">Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset the password for your Placement Management System account.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #1e1b4b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </p>
        <p>If you did not request this, please ignore this email or contact support if you have concerns.</p>
        <p>This link will expire in 15 minutes.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">Placement Management System (PMS)</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message
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

module.exports = {
  registerUser,
  authUser,
  refreshAccessToken,
  verifyOTP,
  logoutUser,
  forgotPassword,
  resetPassword
};
