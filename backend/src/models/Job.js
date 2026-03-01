const mongoose = require('mongoose');
const softDeletePlugin = require('./plugins/softDelete');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    company_name: {
        type: String,
        required: true,
    },
    min_cgpa: {
        type: Number,
        required: true,
    },
    eligible_branch: {
        type: String,
        required: true,
    },
    graduation_year: {
        type: Number,
        required: true,
    },
    max_backlogs_allowed: {
        type: Number,
        default: 0,
    },
    min_marks_10th: {
        type: Number,
        default: 0,
    },
    min_marks_12th: {
        type: Number,
        default: 0,
    },
    diversity_hiring: {
        type: String,
        enum: ['ALL', 'FEMALE_ONLY'],
        default: 'ALL',
    },
    deadline: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'CLOSED'],
        default: 'ACTIVE',
    },
    recruiter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true,
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

jobSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Job', jobSchema);
