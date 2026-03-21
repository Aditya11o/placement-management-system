const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    portalName: {
      type: String,
      default: 'Placement Management System',
    },
    logo: String,
    primaryColor: {
      type: String,
      default: '#007bff',
    },
    secondaryColor: {
      type: String,
      default: '#6c757d',
    },
    contactEmail: String,
    universityName: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
