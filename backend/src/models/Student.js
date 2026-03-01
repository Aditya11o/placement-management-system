const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const softDeletePlugin = require('./plugins/softDelete');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false, // Don't return password by default
    },
    branch: {
        type: String,
        required: true,
    },
    cgpa: {
        type: Number,
        required: true,
    },
    graduation_year: {
        type: Number,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    backlogs_active: {
        type: Number,
        default: 0,
    },
    marks_10th: {
        type: Number,
        required: true,
    },
    marks_12th: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        enum: ['MALE', 'FEMALE', 'OTHER'],
        required: true,
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
    skills: [{ type: String }],
    status: { type: String, enum: ['PENDING', 'APPROVED', 'BLOCKED'], default: 'PENDING' },
    resetPasswordToken: String,
    resetPasswordExpire: Date
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

studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS) || 10);
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
