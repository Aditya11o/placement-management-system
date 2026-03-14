const mongoose = require('mongoose');

const interviewExperienceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },
    company_name: {
        type: String,
        required: [true, 'Please provide the company name'],
        trim: true,
        index: true
    },
    role: {
        type: String,
        required: [true, 'Please provide the role name'],
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    rounds: [{
        name: { type: String, required: true },
        details: { type: String, required: true },
        questions: [String]
    }],
    verdict: {
        type: String,
        enum: ['Selected', 'Rejected', 'Waitlisted', 'In Progress'],
        required: true
    },
    tips: {
        type: String,
        maxlength: [1000, 'Tips cannot exceed 1000 characters']
    },
    is_anonymous: {
        type: Boolean,
        default: true
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    view_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for search performance
interviewExperienceSchema.index({ company_name: 'text', role: 'text' });

module.exports = mongoose.model('InterviewExperience', interviewExperienceSchema);
