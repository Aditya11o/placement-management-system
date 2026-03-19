const mongoose = require('mongoose');
const softDeletePlugin = require('./plugins/softDelete');
const tenantPlugin = require('./plugins/tenantPlugin');

const interviewFeedbackSchema = new mongoose.Schema({
    interview_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
        required: true,
        unique: true, // Only one feedback per interview
        index: true
    },
    recruiter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    scores: {
        technical: { type: Number, min: 1, max: 5 },
        communication: { type: Number, min: 1, max: 5 },
        problem_solving: { type: Number, min: 1, max: 5 },
        culture_fit: { type: Number, min: 1, max: 5 },
        overall: { type: Number, min: 1, max: 5 }
    },
    comments: {
        type: String,
        maxlength: [2000, 'Comments cannot exceed 2000 characters']
    },
    recommendation: {
        type: String,
        enum: ['STRONG_HIRE', 'HIRE', 'HOLD', 'NO_HIRE', 'STRONG_NO_HIRE'],
        required: true
    },
    submitted_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

interviewFeedbackSchema.plugin(softDeletePlugin);
interviewFeedbackSchema.plugin(tenantPlugin);

module.exports = mongoose.model('InterviewFeedback', interviewFeedbackSchema);
