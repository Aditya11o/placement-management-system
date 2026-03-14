const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add an event title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add an event description']
    },
    type: {
        type: String,
        enum: ['WEBINAR', 'PPT', 'DRIVE', 'WORKSHOP'],
        required: true
    },
    startTime: {
        type: Date,
        required: [true, 'Please add a start time']
    },
    endTime: {
        type: Date
    },
    link: {
        type: String,
        required: [true, 'Please add a join link']
    },
    company_name: {
        type: String,
        default: 'External'
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Event', eventSchema);
