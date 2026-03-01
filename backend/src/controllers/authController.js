const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Admin = require('../models/Admin');
const Log = require('../models/Log');
const Session = require('../models/Session');
const UAParser = require('ua-parser-js');
const { emailQueue } = require('../utils/emailQueue');
const { generate2FASecret, verify2FAToken } = require('../utils/totp');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    });
};

const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
};

exports.registerStudent = async (req, res) => {
    try {
        const { name, email, password, branch, cgpa, graduation_year, phone, backlogs_active, marks_10th, marks_12th, gender } = req.body;
        const exists = await Student.findOne({ email });
        if (exists) return res.status(400).json({ success: false, message: 'Student with this email already exists' });

        const student = await Student.create({
            name, email, password, branch, cgpa, graduation_year, phone,
            backlogs_active: backlogs_active || 0,
            marks_10th, marks_12th, gender
        });

        await Log.create({ user_id: student._id, user_role: 'STUDENT', action: 'REGISTER', description: 'Student registered account' });

        res.status(201).json({ success: true, message: 'Student registered successfully, pending admin approval.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.registerRecruiter = async (req, res) => {
    try {
        const { company_name, contact_person, email, password, phone } = req.body;
        const exists = await Recruiter.findOne({ email });
        if (exists) return res.status(400).json({ success: false, message: 'Recruiter with this email already exists' });

        const recruiter = await Recruiter.create({ company_name, contact_person, email, password, phone });

        await Log.create({ user_id: recruiter._id, user_role: 'RECRUITER', action: 'REGISTER', description: 'Recruiter registered account' });

        res.status(201).json({ success: true, message: 'Recruiter registered successfully, pending admin approval.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const { getRedisClient } = require('../config/redis');
const { banIp } = require('../middlewares/blocklistMiddleware');

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Please provide email, password and role (STUDENT, RECRUITER, ADMIN)' });
        }

        const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
        const redisClient = getRedisClient();
        const strikeKey = `failed_login:${clientIp}`;

        let user;
        if (role === 'STUDENT') user = await Student.findOne({ email }).select('+password');
        else if (role === 'RECRUITER') user = await Recruiter.findOne({ email }).select('+password');
        else if (role === 'ADMIN') user = await Admin.findOne({ email }).select('+password');
        else return res.status(400).json({ success: false, message: 'Invalid role specified' });

        if (!user || !(await user.matchPassword(password))) {
            // Track Failed Attempts for Brute-Force Protection
            if (redisClient && redisClient.isReady) {
                const strikes = await redisClient.incr(strikeKey);
                if (strikes === 1) {
                    await redisClient.expire(strikeKey, 900); // 15 mins TTL
                } else if (strikes >= 5) {
                    await banIp(clientIp, 24, 'Brute-force password guessing detected (5+ failed attempts)');
                    await redisClient.del(strikeKey); // reset strikes once banned
                }
            }
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Wipe strikes upon successful primary auth
        if (redisClient && redisClient.isReady) {
            await redisClient.del(strikeKey);
        }

        // Check if user is pending admin approval
        if ((role === 'STUDENT' || role === 'RECRUITER') && user.status !== 'APPROVED') {
            return res.status(403).json({ success: false, message: `Account is ${user.status}. Please await admin approval.` });
        }

        // --- 2FA Check ---
        if (user.twofa_enabled) {
            // Issue a temporary token good for 5 minutes to verify 2FA
            const tempToken = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
                expiresIn: '5m',
            });
            return res.status(200).json({
                success: true,
                requires2FA: true,
                tempToken,
                message: 'Two-factor authentication required. Please verify your token.'
            });
        }

        // Proceed with normal login if 2FA is not enabled
        await completeLogin(user, role, req, res);
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Helper function to complete the login process (used by standard login and 2FA verify)
 */
const completeLogin = async (user, role, req, res) => {
    const token = generateToken(user._id, role);
    const refreshToken = generateRefreshToken();

    // Parse User Agent
    const parser = new UAParser(req.headers['user-agent']);
    const uaInfo = parser.getResult();

    // Expire in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save session
    await Session.create({
        user_id: user._id,
        user_model: role === 'STUDENT' ? 'Student' : (role === 'RECRUITER' ? 'Recruiter' : 'Admin'),
        refresh_token: refreshToken,
        device_info: {
            browser: `${uaInfo.browser.name || 'Unknown'} ${uaInfo.browser.version || ''}`,
            os: `${uaInfo.os.name || 'Unknown'} ${uaInfo.os.version || ''}`,
            device: uaInfo.device.type || 'Desktop'
        },
        ip_address: req.ip,
        expires_at: expiresAt
    });

    const cookieOptions = {
        expires: expiresAt,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || process.env.HTTPS === 'true',
        sameSite: 'strict'
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    await Log.create({ user_id: user._id, user_role: role, action: 'LOGIN', description: 'User logged in', ip_address: req.ip });

    // Return clean user object
    const userObj = {
        _id: user._id,
        email: user.email,
        role,
        name: user.name || user.contact_person,
        company_name: user.company_name,
    };

    res.json({ success: true, token, user: userObj });
};

exports.getMe = async (req, res) => {
    try {
        let user;
        if (req.user.role === 'STUDENT') user = await Student.findById(req.user._id).select('-password');
        else if (req.user.role === 'RECRUITER') user = await Recruiter.findById(req.user._id).select('-password');
        else if (req.user.role === 'ADMIN') user = await Admin.findById(req.user._id).select('-password');

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email, role } = req.body;
        if (!email || !role) return res.status(400).json({ success: false, message: 'Please provide email and role' });

        let user;
        if (role === 'STUDENT') user = await Student.findOne({ email });
        else if (role === 'RECRUITER') user = await Recruiter.findOne({ email });
        else if (role === 'ADMIN') user = await Admin.findOne({ email });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

        // Print to console for easy local testing without needing to check Mailtrap
        console.log(`\n\n[DEV MODE] Password Reset URL generated:\n${resetUrl}\n\n`);

        try {
            await emailQueue.add('password-reset', {
                email: user.email,
                subject: 'Password Reset Request',
                template: 'passwordReset',
                context: {
                    name: user.name,
                    resetToken: resetToken
                }
            });
            res.status(200).json({ success: true, message: 'Email sent' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
        const role = req.body.role;

        if (!role) return res.status(400).json({ success: false, message: 'Please provide role' });

        let user;
        const query = { resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } };

        if (role === 'STUDENT') user = await Student.findOne(query);
        else if (role === 'RECRUITER') user = await Recruiter.findOne(query);
        else if (role === 'ADMIN') user = await Admin.findOne(query);

        if (!user) return res.status(400).json({ success: false, message: 'Invalid token' });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.status(401).json({ success: false, message: 'No refresh token provided' });

        const session = await Session.findOne({ refresh_token: refreshToken });
        if (!session) return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });

        // Generate a fresh, short-lived 15 min access token
        const role = session.user_model === 'Student' ? 'STUDENT' : (session.user_model === 'Recruiter' ? 'RECRUITER' : 'ADMIN');
        const token = generateToken(session.user_id, role);

        res.status(200).json({ success: true, token });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getSessions = async (req, res) => {
    try {
        const sessions = await Session.find({ user_id: req.user._id }).select('-refresh_token').sort('-createdAt');
        res.status(200).json({ success: true, data: sessions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) {
            await Session.findOneAndDelete({ refresh_token: refreshToken });
        }
        res.clearCookie('refreshToken');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.logoutAll = async (req, res) => {
    try {
        await Session.deleteMany({ user_id: req.user._id });
        res.clearCookie('refreshToken');
        res.status(200).json({ success: true, message: 'Logged out of all registered devices' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==========================
// 2FA Endpoints
// ==========================

exports.generate2FA = async (req, res) => {
    try {
        if (req.user.role === 'STUDENT') {
            return res.status(403).json({ success: false, message: '2FA is only available for Admins and Recruiters' });
        }

        const { secret, qrCodeUrl } = await generate2FASecret(req.user.email);

        let user;
        if (req.user.role === 'ADMIN') user = await Admin.findById(req.user._id);
        else if (req.user.role === 'RECRUITER') user = await Recruiter.findById(req.user._id);

        user.twofa_secret = secret;
        // Don't enable it yet, just save the secret. They must verify it to enable it.
        await user.save();

        res.status(200).json({
            success: true,
            qrCodeUrl,
            message: 'Scan the QR code with your authenticator app and verify to enable 2FA.'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.enable2FA = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ success: false, message: 'Please provide the 6-digit token from your authenticator app.' });

        const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
        const redisClient = getRedisClient();
        const strikeKey = `failed_login:${clientIp}`;

        let user;
        if (req.user.role === 'ADMIN') user = await Admin.findById(req.user._id).select('+twofa_secret');
        else if (req.user.role === 'RECRUITER') user = await Recruiter.findById(req.user._id).select('+twofa_secret');
        else return res.status(403).json({ success: false, message: 'Unsupported role for 2FA' });

        if (!user.twofa_secret) {
            return res.status(400).json({ success: false, message: 'No 2FA secret found. Please generate 2FA first.' });
        }

        const isValid = verify2FAToken(user.twofa_secret, token);

        if (!isValid) {
            if (redisClient && redisClient.isReady) {
                const strikes = await redisClient.incr(strikeKey);
                if (strikes === 1) await redisClient.expire(strikeKey, 900);
                else if (strikes >= 5) {
                    await banIp(clientIp, 24, '2FA setup token guessing detected (5+ failed attempts)');
                    await redisClient.del(strikeKey);
                }
            }
            return res.status(400).json({ success: false, message: 'Invalid 2FA token. Try again.' });
        }

        if (redisClient && redisClient.isReady) await redisClient.del(strikeKey);

        user.twofa_enabled = true;
        await user.save();

        await Log.create({ user_id: user._id, user_role: req.user.role, action: 'ENABLE_2FA', description: 'User enabled Two-Factor Authentication' });

        res.status(200).json({ success: true, message: 'Two-Factor Authentication has been successfully enabled.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.verifyLogin2FA = async (req, res) => {
    try {
        const { tempToken, token } = req.body;
        if (!tempToken || !token) {
            return res.status(400).json({ success: false, message: 'Temporary token and 6-digit code are required.' });
        }

        const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
        const redisClient = getRedisClient();
        const strikeKey = `failed_login:${clientIp}`; // Share block bucket with primary login

        // Verify temp token
        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Temporary token is invalid or expired.' });
        }

        const { id, role } = decoded;

        let user;
        if (role === 'ADMIN') user = await Admin.findById(id).select('+twofa_secret');
        else if (role === 'RECRUITER') user = await Recruiter.findById(id).select('+twofa_secret');
        else return res.status(401).json({ success: false, message: 'Invalid role for 2FA' });

        if (!user || (!user.twofa_enabled || !user.twofa_secret)) {
            return res.status(400).json({ success: false, message: '2FA is not enabled for this user.' });
        }

        const isValid = verify2FAToken(user.twofa_secret, token);

        if (!isValid) {
            // Track Failed Attempts for Brute-Force Protection
            if (redisClient && redisClient.isReady) {
                const strikes = await redisClient.incr(strikeKey);
                if (strikes === 1) {
                    await redisClient.expire(strikeKey, 900); // 15 mins TTL
                } else if (strikes >= 5) {
                    await banIp(clientIp, 24, 'Brute-force 2FA guessing detected (5+ failed attempts)');
                    await redisClient.del(strikeKey); // reset strikes once banned
                }
            }
            return res.status(401).json({ success: false, message: 'Invalid 2FA token.' });
        }

        // Wipe strikes upon successful final auth
        if (redisClient && redisClient.isReady) {
            await redisClient.del(strikeKey);
        }

        // 2FA verified successfully, complete the login
        await completeLogin(user, role, req, res);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.disable2FA = async (req, res) => {
    try {
        const { password, token } = req.body; // Require password and current 2FA token to disable

        if (!password || !token) {
            return res.status(400).json({ success: false, message: 'Please provide your password and current 2FA token to disable 2FA.' });
        }

        let user;
        if (req.user.role === 'ADMIN') user = await Admin.findById(req.user._id).select('+password +twofa_secret');
        else if (req.user.role === 'RECRUITER') user = await Recruiter.findById(req.user._id).select('+password +twofa_secret');
        else return res.status(403).json({ success: false, message: 'Unsupported role for 2FA' });

        if (!user.twofa_enabled || !user.twofa_secret) {
            return res.status(400).json({ success: false, message: '2FA is already disabled.' });
        }

        if (!(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid password.' });
        }

        const isValid = verify2FAToken(user.twofa_secret, token);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid 2FA token.' });
        }

        user.twofa_enabled = false;
        user.twofa_secret = undefined;
        await user.save();

        await Log.create({ user_id: user._id, user_role: req.user.role, action: 'DISABLE_2FA', description: 'User disabled Two-Factor Authentication' });

        res.status(200).json({ success: true, message: 'Two-Factor Authentication has been successfully disabled.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Configure Recruiter Webhook URL
// @route   PUT /api/v1/auth/webhook
// @access  Private (Recruiter only)
exports.configureWebhook = async (req, res) => {
    try {
        if (req.user.role !== 'RECRUITER') {
            return res.status(403).json({ success: false, message: 'Only recruiters can configure webhooks' });
        }

        const { webhook_url } = req.body;

        const recruiter = await Recruiter.findById(req.user._id);
        if (!recruiter) {
            return res.status(404).json({ success: false, message: 'Recruiter not found' });
        }

        recruiter.webhook_url = webhook_url || ''; // Empty string lets them clear it
        await recruiter.save({ validateModifiedOnly: true });

        res.status(200).json({
            success: true,
            data: {
                webhook_url: recruiter.webhook_url
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
