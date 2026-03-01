const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    application_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    recruiter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true
    },
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    scheduled_at: {
        type: Date,
        required: [true, 'Please provide the interview date and time']
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
        default: 'PROPOSED'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);
