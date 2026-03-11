const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Admin = require('../models/Admin');
const Company = require('../models/Company');
const Log = require('../models/Log');
const Session = require('../models/Session');
const UAParser = require('ua-parser-js');
const { emailQueue } = require('../utils/emailQueue');
const config = require('../config/config');
const { sendSystemAlert } = require('../utils/webhookHelper');
const logger = require('../utils/logger');
const GlobalSettings = require('../models/GlobalSettings');
const { generate2FASecret, verify2FAToken } = require('../utils/totp');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, config.get('jwt.secret'), {
        expiresIn: '15m',
    });
};

const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
};

exports.registerStudent = async (req, res) => {
    try {
        const settings = await GlobalSettings.findOne({ singletonId: 'nexus_settings' });
        if (settings && !settings.allowStudentRegistration) {
            return res.status(403).json({ success: false, message: 'Student registration is currently disabled by the administrator.' });
        }

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
        const settings = await GlobalSettings.findOne({ singletonId: 'nexus_settings' });
        if (settings && !settings.allowRecruiterRegistration) {
            return res.status(403).json({ success: false, message: 'Recruiter registration is currently disabled by the administrator.' });
        }

        const { company_name, contact_person, email, password, phone, join_code } = req.body;
        const exists = await Recruiter.findOne({ email });
        if (exists) return res.status(400).json({ success: false, message: 'Recruiter with this email already exists' });

        let company;
        let role = 'OWNER';

        if (join_code) {
            company = await Company.findOne({ join_code });
            if (!company) {
                return res.status(400).json({ success: false, message: 'Invalid join code. Please check with your team administrator.' });
            }
            role = 'MEMBER';
        } else if (!company_name) {
            return res.status(400).json({ success: false, message: 'Company name is required if not using a join code.' });
        }

        // Create recruiter first (but don't save yet if we need company_id)
        const recruiter = new Recruiter({ 
            company_name: company ? company.name : company_name, 
            contact_person, 
            email, 
            password, 
            phone,
            team_role: role
        });

        if (!company) {
            // Create new company
            company = await Company.create({
                name: company_name,
                owner_id: recruiter._id
            });
        }

        recruiter.company_id = company._id;
        await recruiter.save();

        await Log.create({ user_id: recruiter._id, user_role: 'RECRUITER', action: 'REGISTER', description: `Recruiter registered as ${role} for ${company.name}` });

        // 🔌 Trigger System Webhook if configured
        if (settings && settings.systemWebhookUrl) {
            await sendSystemAlert(
                settings.systemWebhookUrl,
                `🚀 **New Recruiter Registered!**`,
                {
                    'Company': company.name,
                    'Role': role,
                    'Contact': contact_person,
                    'Email': email,
                    'Timestamp': new Date().toLocaleString()
                }
            );
        }

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
            const settings = await GlobalSettings.findOne({ singletonId: 'nexus_settings' });
            const maxStrikes = settings?.maxFailedLoginAttempts || 5;

            // Track Failed Attempts for Brute-Force Protection
            if (redisClient && redisClient.isReady) {
                const strikes = await redisClient.incr(strikeKey);
                if (strikes === 1) {
                    await redisClient.expire(strikeKey, 900); // 15 mins TTL
                } else if (strikes >= maxStrikes) {
                    await banIp(clientIp, 24, `Brute-force password guessing detected (${strikes}+ failed attempts)`);
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

        // Check for 2FA requirement
        if (user.twofa_enabled) {
            const tempToken = jwt.sign({ id: user._id, role }, config.get('jwt.secret'), { expiresIn: '5m' });
            return res.status(200).json({ 
                success: true, 
                requires2FA: true, 
                tempToken,
                message: 'Please provide the 2FA token from your authenticator app.'
            });
        }

        // Proceed with normal login
        await completeLogin(user, role, req, res);
    } catch (err) {
        logger.error(`Login Error: ${err.message}`);
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

    const settings = await GlobalSettings.findOne({ singletonId: 'nexus_settings' });
    const sessionHours = settings?.sessionExpirationHours || 168;

    // Calculate expiry based on settings
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + sessionHours);

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
        secure: config.get('env') === 'production' || config.get('https'),
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
    };

    if (role === 'RECRUITER') {
        // JIT Migration: Link legacy recruiter to a Company based on name
        if (!user.company_id) {
            let company = await Company.findOne({ name: user.company_name });
            if (!company) {
                company = await Company.create({
                    name: user.company_name,
                    owner_id: user._id
                });
                user.team_role = 'OWNER';
            }
            user.company_id = company._id;
            await user.save();

            // Link existing jobs to the new company context
            const Job = require('../models/Job');
            await Job.updateMany(
                { recruiter_id: user._id, company_id: { $exists: false } },
                { $set: { company_id: company._id } }
            );
        }
        userObj.company_name = user.company_name;
        userObj.company_id = user.company_id;
        userObj.team_role = user.team_role || 'MEMBER';
    }

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

        // Print to log for easy local testing without needing to check Mailtrap
        logger.info(`[DEV MODE] Password Reset URL generated: ${resetUrl}`);

        try {
            await emailQueue.add('password-reset', {
                email: user.email,
                subject: 'Password Reset Request',
                template: 'passwordReset',
                context: {
                    name: user.name || user.contact_person,
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

exports.verify2FALogin = async (req, res) => {
    try {
        const { tempToken, token } = req.body;
        if (!tempToken || !token) {
            return res.status(400).json({ success: false, message: 'Please provide tempToken and 2FA token' });
        }

        const decoded = jwt.verify(tempToken, config.get('jwt.secret'));
        const { id, role } = decoded;

        let user;
        if (role === 'ADMIN') user = await Admin.findById(id).select('+twofa_secret');
        else if (role === 'RECRUITER') user = await Recruiter.findById(id).select('+twofa_secret');

        if (!user || !user.twofa_secret) {
            return res.status(404).json({ success: false, message: 'User or 2FA secret not found' });
        }

        const isValid = verify2FAToken(user.twofa_secret, token);
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Invalid 2FA token' });
        }

        await completeLogin(user, role, req, res);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.disable2FA = async (req, res) => {
    try {
        const { password, token } = req.body;
        if (!password || !token) {
            return res.status(400).json({ success: false, message: 'Please provide password and 2FA token' });
        }

        let user;
        if (req.user.role === 'ADMIN') user = await Admin.findById(req.user._id).select('+password +twofa_secret');
        else if (req.user.role === 'RECRUITER') user = await Recruiter.findById(req.user._id).select('+password +twofa_secret');

        if (!(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        const isValid = verify2FAToken(user.twofa_secret, token);
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Invalid 2FA token' });
        }

        user.twofa_enabled = false;
        user.twofa_secret = undefined;
        await user.save();

        await Log.create({ user_id: user._id, user_role: req.user.role, action: 'DISABLE_2FA', description: 'User disabled Two-Factor Authentication' });

        res.status(200).json({ success: true, message: '2FA disabled successfully' });
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
// @desc    Update Recruiter Profile
// @route   PUT /api/v1/auth/recruiter/profile
// @access  Private (Recruiter only)
exports.updateRecruiterProfile = async (req, res) => {
    try {
        if (req.user.role !== 'RECRUITER') {
            return res.status(403).json({ success: false, message: 'Only recruiters can update this profile' });
        }

        const { name, company_name, website, description, webhook_url } = req.body;

        const recruiter = await Recruiter.findById(req.user._id);
        if (!recruiter) return res.status(404).json({ success: false, message: 'Recruiter not found' });

        if (name) recruiter.contact_person = name;
        if (company_name) recruiter.company_name = company_name;
        if (website !== undefined) recruiter.website = website;
        if (description !== undefined) recruiter.description = description;
        if (webhook_url !== undefined) recruiter.webhook_url = webhook_url;

        await recruiter.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: recruiter
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
