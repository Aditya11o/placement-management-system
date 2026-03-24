const mongoose = require('mongoose');

const mentorProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  expertise: {
    type: [String], // Technical, HR, Aptitude, Resume Clinic, etc.
    required: true
  },
  available_days: [String],
  available_time_slots: [String],
  mode: {
    type: String,
    enum: ['Online', 'Offline', 'Both'],
    default: 'Online'
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('MentorProfile', mentorProfileSchema);
