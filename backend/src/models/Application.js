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
        enum: ['SUBMITTED', 'REVIEWED', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'OFFER_ACCEPTED', 'OFFER_DECLINED'],
        default: 'SUBMITTED',
        index: true,
    },
    // Auto-generated when status reaches SELECTED
    offer_letter_url: { type: String, default: null },
    offer_letter_generated_at: { type: Date, default: null },
    offer_issued_at: { type: Date, default: null },
    offer_expires_at: { type: Date, default: null },
    
    // Interview Scorecards
    scorecards: [{
        reviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
        reviewer_name: { type: String, required: true },
        round_name: { type: String, default: 'General' },
        communication: { type: Number, min: 1, max: 5, required: true },
        technical: { type: Number, min: 1, max: 5, required: true },
        culture: { type: Number, min: 1, max: 5, required: true },
        overall: { type: Number, min: 1, max: 5, required: true },
        recommendation: { 
            type: String, 
            enum: ['HIRE', 'NO_HIRE', 'MAYBE'], 
            default: 'MAYBE' 
        },
        comments: { type: String, default: '' },
        created_at: { type: Date, default: Date.now }
    }],
    
    // Interactive Student Journal (Phase 4)
    student_notes: { type: String, default: '' },
    checklists: [{
        task: { type: String, required: true },
        completed: { type: Boolean, default: false },
        category: { 
            type: String, 
            enum: ['GENERAL', 'TECHNICAL', 'HR', 'RESOURCES'], 
            default: 'GENERAL' 
        },
        priority: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH'],
            default: 'MEDIUM'
        }
    }]
}, {
    timestamps: { createdAt: 'applied_at', updatedAt: false }
});

// Enforce unique application per job per student
applicationSchema.index({ student_id: 1, job_id: 1 }, { unique: true });
// Index for sorting by application date
applicationSchema.index({ applied_at: -1 });

applicationSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Application', applicationSchema);
