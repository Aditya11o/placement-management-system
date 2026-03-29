const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyProfile',
      required: true,
    },
    recruiter_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    full_name: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
    },
    profile_photo: {
      type: String,
    },
    designation: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    last_login: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const RecruiterProfile = mongoose.model('RecruiterProfile', recruiterProfileSchema);

module.exports = RecruiterProfile;
