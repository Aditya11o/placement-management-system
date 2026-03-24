const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Account Management',
        'Job Applications',
        'Interview Support',
        'Resume Builder',
        'Technical Issues',
        'Other Queries'
      ],
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
