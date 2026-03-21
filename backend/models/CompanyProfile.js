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
      required: true,
      validate: {
        validator: function(v) {
          return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(v);
        },
        message: 'Please enter a valid website URL',
      },
    },
    description: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    company_size: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    hr_name: {
      type: String,
      required: true,
    },
    hr_email: {
      type: String,
      required: true,
      lowercase: true,
    },
    hr_phone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);

module.exports = CompanyProfile;
