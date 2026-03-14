const mongoose = require('mongoose');

const liveEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    host: {
        type: String,
        required: [true, 'Please specify the host (e.g., Google, Placement Cell)']
    },
    event_date: {
        type: Date,
        required: [true, 'Please provide the event date and time']
    },
    join_link: {
        type: String,
        required: [true, 'Please provide a join link']
    },
    type: {
        type: String,
        enum: ['WEBINAR', 'PPT', 'DRIVE', 'WORKSHOP'],
        default: 'WEBINAR',
        index: true
    },
    registrations: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        registered_at: {
            type: Date,
            default: Date.now
        }
    }],
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('LiveEvent', liveEventSchema);
