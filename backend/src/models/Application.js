const mongoose = require('mongoose');
const softDeletePlugin = require('./plugins/softDelete');

const applicationSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    status: {
        type: String,
        enum: ['SUBMITTED', 'REVIEWED', 'SHORTLISTED', 'SELECTED', 'REJECTED'],
        default: 'SUBMITTED',
    },
    // Auto-generated when status reaches SELECTED
    offer_letter_url: { type: String, default: null },
    offer_letter_generated_at: { type: Date, default: null }
}, {
    timestamps: { createdAt: 'applied_at', updatedAt: false }
});

applicationSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Application', applicationSchema);
