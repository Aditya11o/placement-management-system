const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config/config');

const recruiterSchema = new mongoose.Schema({
    company_name: {
        type: String,
        required: true,
    },
    contact_person: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
    },
    logo_url: {
        type: String,
    },
    webhook_url: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please enter a valid HTTP/HTTPS URL'
        ]
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'BLOCKED'],
        default: 'PENDING',
        index: true,
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        index: true
    },
    team_role: {
        type: String,
        enum: ['OWNER', 'MEMBER'],
        default: 'MEMBER'
    },
    twofa_secret: {
        type: String,
        select: false,
    },
    twofa_enabled: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

recruiterSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(config.get('salt_rounds'));
    this.password = await bcrypt.hash(this.password, salt);
});

recruiterSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
recruiterSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

module.exports = mongoose.model('Recruiter', recruiterSchema);
