const mongoose = require('mongoose');
const softDeletePlugin = require('./plugins/softDelete');

const applicationSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true,
    },
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['SUBMITTED', 'REVIEWED', 'SHORTLISTED', 'SELECTED', 'REJECTED'],
        default: 'SUBMITTED',
        index: true,
    },
    // Auto-generated when status reaches SELECTED
    offer_letter_url: { type: String, default: null },
    offer_letter_generated_at: { type: Date, default: null }
}, {
    timestamps: { createdAt: 'applied_at', updatedAt: false }
});

// Enforce unique application per job per student
applicationSchema.index({ student_id: 1, job_id: 1 }, { unique: true });

applicationSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Application', applicationSchema);
