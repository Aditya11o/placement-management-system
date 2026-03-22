const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      enum: ['Interview Questions', 'Mock Tests', 'Aptitude', 'Technical', 'General'],
      default: 'General',
    },
    type: {
      type: String,
      enum: ['Link', 'File'],
      required: true,
    },
    content: {
      type: String, // URL
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
