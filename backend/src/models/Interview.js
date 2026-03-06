const mongoose = require('mongoose');
const softDeletePlugin = require('./plugins/softDelete');

const interviewSchema = new mongoose.Schema({
    application_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true,
        index: true
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },
    recruiter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true,
        index: true
    },
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
        index: true
    },
    scheduled_at: {
        type: Date,
        required: [true, 'Please provide the interview date and time'],
        index: true
    },
    location_type: {
        type: String,
        enum: ['VIRTUAL', 'PHYSICAL'],
        required: [true, 'Please specify if the interview is VIRTUAL or PHYSICAL']
    },
    location_details: {
        type: String,
        required: [true, 'Please provide the meeting link or physical address']
    },
    status: {
        type: String,
        enum: ['PROPOSED', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELED'],
        default: 'PROPOSED',
        index: true
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    calendar_provider: {
        type: String,
        enum: ['GOOGLE', 'OUTLOOK', 'NONE'],
        default: 'NONE'
    },
    external_event_id: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

interviewSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Interview', interviewSchema);
