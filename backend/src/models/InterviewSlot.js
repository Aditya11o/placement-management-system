const softDeletePlugin = require('./plugins/softDelete');
const tenantPlugin = require('./plugins/tenantPlugin');

const interviewSlotSchema = new mongoose.Schema({
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
    start_time: {
        type: Date,
        required: [true, 'Please provide the slot start time'],
        index: true
    },
    end_time: {
        type: Date,
        required: [true, 'Please provide the slot end time']
    },
    is_booked: {
        type: Boolean,
        default: false,
        index: true
    },
    application_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        default: null
    }
}, {
    timestamps: true
});

interviewSlotSchema.plugin(softDeletePlugin);
interviewSlotSchema.plugin(tenantPlugin);

module.exports = mongoose.model('InterviewSlot', interviewSlotSchema);
