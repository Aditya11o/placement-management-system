const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema(
  {
    company_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    recruiter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    company_logo: {
      type: String,
    },
    website: {
      type: String,
    },
    description: {
      type: String,
    },
    industry: {
      type: String,
    },
    company_size: {
      type: String,
    },
    location: {
      type: String,
    },
    hr_name: {
      type: String,
    },
    hr_email: {
      type: String,
      lowercase: true,
    },
    hr_phone: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);

module.exports = CompanyProfile;
