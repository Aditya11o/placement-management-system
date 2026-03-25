const mongoose = require('mongoose');

const studentSettingsSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    notifications: {
      jobs: { type: Boolean, default: true },
      apps: { type: Boolean, default: true },
      interviews: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },
    privacy: {
      visible: { type: Boolean, default: true },
      showPhone: { type: Boolean, default: false },
      showEmail: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

const StudentSettings = mongoose.model('StudentSettings', studentSettingsSchema);

module.exports = StudentSettings;
