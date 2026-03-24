const mongoose = require('mongoose');

const mentorAvailabilitySchema = new mongoose.Schema({
  mentor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time_slot: {
    type: String, // e.g., "09:00 AM"
    required: true
  },
  is_booked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Ensure unique slot per mentor per date
mentorAvailabilitySchema.index({ mentor_id: 1, date: 1, time_slot: 1 }, { unique: true });

module.exports = mongoose.model('MentorAvailability', mentorAvailabilitySchema);
