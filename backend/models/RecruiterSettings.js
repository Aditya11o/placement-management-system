const mongoose = require('mongoose');

const recruiterSettingsSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    notifications: {
      emailSummary: { type: Boolean, default: true },
      interviewAlerts: { type: Boolean, default: true },
      applicationAlerts: { type: Boolean, default: true },
    },
    marketing: {
      newsletter: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

const RecruiterSettings = mongoose.model('RecruiterSettings', recruiterSettingsSchema);

module.exports = RecruiterSettings;
