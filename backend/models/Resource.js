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
      enum: [
        'Technical Rounds', 
        'HR Questions', 
        'Aptitude Prep', 
        'Group Discussion', 
        'Video Masterclass', 
        'Curated Resources',
        'System Design',
        'Resume Clinic',
        'General'
      ],
      default: 'General',
    },
    type: {
      type: String,
      enum: ['Link', 'File', 'Video'],
      required: true,
    },
    content: {
      type: String, // URL
      required: true,
    },
    thumbnail: String,
    duration: String,
    instructor: String,
    tags: [String],
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
