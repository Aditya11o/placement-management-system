const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config/config');

// ── Grant registry — canonical list of all available permissions ──────────────
const ALL_PERMISSIONS = [
    'manage_students',         // View, approve, block, delete students
    'manage_recruiters',       // View, approve, block, delete recruiters
    'manage_jobs',             // Close / delete job postings
    'manage_applications',     // Update application statuses
    'manage_announcements',    // Create / delete announcements
    'view_analytics',          // Access analytics dashboard
    'view_logs',               // Access audit logs
    'manage_api_keys',         // Generate / revoke API keys
    'export_data',             // Trigger CSV or DB exports
    'manage_admins'            // SUPER_ADMIN only: grant/revoke permissions to other admins
];

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: { type: String, required: true, select: false },

    // ── RBAC sub-role ──────────────────────────────────────────────────────────
    sub_role: {
        type: String,
        enum: ['SUPER_ADMIN', 'PLACEMENT_COORDINATOR', 'DEPARTMENT_HEAD', 'ADMIN'],
        default: 'ADMIN'
    },
    branch: {
        type: String,
        required: function() { return this.sub_role === 'DEPARTMENT_HEAD'; },
        description: 'Branch name for Department Heads'
    },

    /**
     * Explicit permission grants for non-SUPER_ADMIN accounts.
     * SUPER_ADMIN implicitly has ALL permissions (checked in hasPermission()).
     * Default for new ADMIN accounts: a sensible base set.
     */
    permissions: {
        type: [String],
        enum: ALL_PERMISSIONS,
        default: ['manage_students', 'manage_recruiters', 'view_analytics', 'view_logs']
    },

    twofa_secret: { type: String, select: false },
    twofa_enabled: { type: Boolean, default: false },
    api_keys: [{
        name: { type: String, required: true },
        keyHash: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    internal_notes: {
        type: String,
        default: ''
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    verification_token: String,
    verification_token_expire: Date
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(config.get('salt_rounds'));
    this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Check if this admin account holds a specific permission.
 * FOR TESTING: All sub-roles (SUPER_ADMIN, PLACEMENT_COORDINATOR, ADMIN) return true.
 */
adminSchema.methods.hasPermission = function (permission) {
    if (this.isSuperAdmin()) return true;
    return this.permissions && this.permissions.includes(permission);
};

/**
 * Check if this admin is a SUPER_ADMIN.
 */
adminSchema.methods.isSuperAdmin = function () {
    return this.sub_role === 'SUPER_ADMIN';
};

// Generate and hash password token
adminSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

adminSchema.methods.getVerificationToken = function () {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    this.verification_token = token;
    this.verification_token_expire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return token;
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
module.exports.ALL_PERMISSIONS = ALL_PERMISSIONS;
