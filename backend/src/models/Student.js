const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');
const softDeletePlugin = require('./plugins/softDelete');
const tenantPlugin = require('./plugins/tenantPlugin');
const config = require('../config/config');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        validate: { 
            validator: (v) => validator.isEmail(v), 
            message: 'Please add a valid email' 
        }
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Don't return password by default
    },
    branch: {
        type: String,
        required: true,
        index: true,
    },
    cgpa: {
        type: Number,
        required: [true, 'Please add CGPA'],
        min: [0, 'CGPA cannot be negative'],
        max: [10, 'CGPA cannot exceed 10']
    },
    graduation_year: {
        type: Number,
        required: true,
        index: true,
    },
    phone: {
        type: String,
        required: true,
    },
    backlogs_active: {
        type: Number,
        default: 0,
        min: [0, 'Backlogs cannot be negative']
    },
    marks_10th: {
        type: Number,
        required: [true, 'Please add 10th marks'],
        min: 0,
        max: 100
    },
    marks_12th: {
        type: Number,
        required: [true, 'Please add 12th marks'],
        min: 0,
        max: 100
    },
    gender: {
        type: String,
        enum: ['MALE', 'FEMALE', 'OTHER'],
        required: true,
    },
    profile_image_url: {
        type: String,
        default: null
    },
    resume_versions: [{
        version: { type: Number, required: true },          // 1, 2, 3 …
        url: { type: String, required: true },               // Cloudinary secure URL
        public_id: { type: String },                         // Cloudinary public_id (for deletion)
        skills: [{ type: String }],                          // Skills extracted from this version
        label: { type: String, default: '' },                // Optional user-defined label e.g. "Final v3"
        is_active: { type: Boolean, default: false },         // Which version recruiters see
        uploaded_at: { type: Date, default: Date.now }
    }],
    skills: [{ type: String, index: true }],
    status: { type: String, enum: ['PENDING', 'APPROVED', 'BLOCKED'], default: 'PENDING', index: true },
    is_placed: { type: Boolean, default: false },
    placement_details: {
        job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        company_name: String,
        package_lpa: Number,
        placed_at: Date
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    gamification: {
        streak: {
            current: { type: Number, default: 0 },
            last_activity: { type: Date, default: null },
            longest: { type: Number, default: 0 }
        },
        badges: [{
            type: { type: String, required: true },
            earned_at: { type: Date, default: Date.now }
        }],
        points: { type: Number, default: 0 }
    },
    projects: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        technologies: [String],
        link: String,
        duration: String,
        created_at: { type: Date, default: Date.now }
    }],
    internships: [{
        company: { type: String, required: true },
        role: { type: String, required: true },
        description: { type: String, required: true },
        duration: String,
        certificate_url: String,
        created_at: { type: Date, default: Date.now }
    }],
    public_profile_slug: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    portfolio_theme: {
        type: String,
        enum: ['MINIMALIST', 'CREATIVE', 'TECHNICAL', 'EXECUTIVE'],
        default: 'MINIMALIST'
    },
    internal_notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ── Virtual: the currently active resume version doc ─────────────────────────
studentSchema.virtual('activeResume').get(function () {
    if (!this.resume_versions || this.resume_versions.length === 0) return null;
    return this.resume_versions.find(v => v.is_active) ||
        this.resume_versions[this.resume_versions.length - 1]; // fallback: latest
});

// ── Virtual: backward-compatible `resume_url` alias ──────────────────────────
// Existing code that reads `student.resume_url` will automatically get the
// active version's URL without any changes to callers.
studentSchema.virtual('resume_url').get(function () {
    const active = this.activeResume;
    return active ? active.url : null;
});

// Apply soft-delete retention strategy
studentSchema.plugin(softDeletePlugin);
studentSchema.plugin(tenantPlugin);

studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(config.get('salt_rounds'));
    this.password = await bcrypt.hash(this.password, salt);
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
studentSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

module.exports = mongoose.model('Student', studentSchema);
