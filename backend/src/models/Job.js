const mongoose = require('mongoose');
const softDeletePlugin = require('./plugins/softDelete');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    company_name: {
        type: String,
        required: [true, 'Please add a company name'],
    },
    package_lpa: {
        type: Number,
        required: [true, 'Please specify the package in LPA'],
        min: [0, 'Package cannot be negative']
    },
    salary_min: {
        type: Number,
        default: 0
    },
    salary_max: {
        type: Number,
        default: 0
    },
    has_equity: {
        type: Boolean,
        default: false
    },
    has_bonus: {
        type: Boolean,
        default: false
    },
    min_cgpa: {
        type: Number,
        required: [true, 'Please add minimum CGPA requirement'],
        min: [0, 'CGPA cannot be negative'],
        max: [10, 'CGPA cannot exceed 10']
    },
    eligible_branch: {
        type: String,
        required: [true, 'Please specify eligible branch(es)'],
    },
    graduation_year: {
        type: Number,
        required: [true, 'Please specify target graduation year'],
        index: true,
    },
    max_backlogs_allowed: {
        type: Number,
        default: 0,
        min: [0, 'Backlogs cannot be negative']
    },
    min_marks_10th: {
        type: Number,
        default: 0,
        min: [0, 'Marks cannot be negative'],
        max: [100, 'Marks cannot exceed 100']
    },
    min_marks_12th: {
        type: Number,
        default: 0,
        min: [0, 'Marks cannot be negative'],
        max: [100, 'Marks cannot exceed 100']
    },
    diversity_hiring: {
        type: String,
        enum: ['ALL', 'FEMALE_ONLY'],
        default: 'ALL',
    },
    deadline: {
        type: Date,
        required: [true, 'Please add an application deadline'],
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'CLOSED'],
        default: 'ACTIVE',
        index: true,
    },
    recruiter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true,
        index: true,
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        index: true
    },
    is_approved: {
        type: Boolean,
        default: false,
        index: true
    },
    is_featured: {
        type: Boolean,
        default: false,
        index: true
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Compound index for frequent eligibility lookups
jobSchema.index({ eligible_branch: 1, status: 1 });

jobSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Job', jobSchema);
