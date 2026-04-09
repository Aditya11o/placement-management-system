const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const generateToken = require('../utils/generateToken');
const generateRefreshToken = require('../utils/generateRefreshToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailUtils');
const { validateEmailDomain } = require('../utils/domainValidator');
const { createAuditLog } = require('./auditLogController');

// Helper to set tokens as cookies
const setTokenCookies = (res, user) => {
  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

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

  // Domain Validation
  const { isValid, message } = validateEmailDomain(email, role);
  if (!isValid) {
    return res.status(400).json({ message });
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password before saving (since Prisma doesn't have pre-save hooks easily)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role,
        status: role === 'recruiter' ? 'pending' : 'active',
      },
    });

    if (user) {
      // Create specialized profile based on role
      if (role === 'student') {
        await prisma.studentProfile.create({ data: { userId: user.id } });
      } else if (role === 'recruiter') {
        await prisma.recruiterProfile.create({ data: { userId: user.id } });
      } else if (role === 'admin') {
        await prisma.adminProfile.create({ data: { userId: user.id } });
      } else if (role === 'mentor') {
        await prisma.mentorProfile.create({ data: { userId: user.id } });
      } else if (role === 'alumni') {
        await prisma.alumniProfile.create({ data: { userId: user.id } });
      }

      // Email notifications
      try {
        await sendEmail({
          email: user.email,
          subject: role === 'recruiter' ? 'Recruiter Account Pending Approval' : 'Welcome to Placement Management System',
          template: 'welcome',
          context: {
            name: user.name,
            role: user.role,
            loginUrl: `${process.env.FRONTEND_URL}/login`
          }
        });
      } catch (err) {
        console.error('Email failed to send:', err);
      }

      const { token, refreshToken } = setTokenCookies(res, user);

      await createAuditLog({
        userId: user.id,
        action: 'User Registered',
        type: 'AUTH',
        details: { role: user.role }
      });

      res.status(201).json({
        _id: user.id, // Mapping id to _id for frontend compatibility
        id: user.id,
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
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.lockUntil && Number(user.lockUntil) > Date.now()) {
      return res.status(401).json({ 
        message: 'Account is locked. Please try again after 15 minutes or reset your password.' 
      });
    }

    // Compare password manually
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Reset login attempts on success
      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: 0, lockUntil: null }
      });

      // Check if 2FA is needed (for Admin and Mentors)
      if (user.role === 'admin' || user.role === 'mentor') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            otp, 
            otpExpires: new Date(Date.now() + 10 * 60 * 1000) 
          }
        });

        // Send OTP Email
        try {
          await sendEmail({
            email: user.email,
            subject: 'Your 2FA Login Code',
            template: 'otp',
            context: { name: user.name, otp, expiryTime: '10 minutes' }
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

      await createAuditLog({
        userId: user.id,
        action: 'User Logged In',
        type: 'AUTH',
        ipAddress: req.ip
      });

      res.json({
        _id: user.id, // Mapping id to _id for frontend compatibility
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token,
        refreshToken,
      });
    } else {
      // Increment login attempts
      const newAttempts = user.loginAttempts + 1;
      let lockUntil = user.lockUntil;
      if (newAttempts >= 5) {
        lockUntil = Date.now() + 15 * 60 * 1000;
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: newAttempts, lockUntil: lockUntil }
      });
      
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
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.otp !== otp || (user.otpExpires && user.otpExpires < new Date(Date.now()))) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: { otp: null, otpExpires: null }
    });

    const { token, refreshToken } = setTokenCookies(res, user);

    res.json({
      _id: user.id,
      id: user.id,
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
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid user' });
    }

    const accessToken = generateToken(user.id);
    
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  await createAuditLog({
    userId: req.user.id,
    action: 'User Logged Out',
    type: 'AUTH'
  });

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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: hashedToken,
        reset_token_expiry: new Date(Date.now() + 15 * 60 * 1000)
      }
    });

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        template: 'password-reset',
        context: { name: user.name, resetUrl }
      });
      res.json({ message: 'Reset link sent to your email' });
    } catch (err) {
      console.error('SMTP Error:', err);
      await prisma.user.update({
        where: { id: user.id },
        data: { reset_token: null, reset_token_expiry: null }
      });
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

    const user = await prisma.user.findFirst({
      where: {
        reset_token: hashedToken,
        reset_token_expiry: { gt: new Date(Date.now()) }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      }
    });

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
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    if (!(await bcrypt.compare(current_password, user.password))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    await createAuditLog({
      userId: user.id,
      action: 'Password Updated',
      type: 'AUTH'
    });

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
    await prisma.user.update({
      where: { id: req.user.id },
      data: { status: 'inactive' }
    });
    
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
