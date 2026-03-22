const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Common fields
    bio: String,
    avatar: String,
    
    // Student specific fields
    studentDetails: {
      rollNo: String,
      course: String,
      branch: String,
      cgpa: Number,
      passingYear: Number,
      skills: [String],
      verifiedSkills: [
        {
          skill: String,
          status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
          certificateUrl: String,
          appliedAt: { type: Date, default: Date.now },
        }
      ],
      resumes: [
        {
          name: String,
          url: String,
          isDefault: { type: Boolean, default: false },
          uploadedAt: { type: Date, default: Date.now },
        }
      ],
      placementStatus: {
        type: String,
        enum: ['Unplaced', 'Placed', 'Interned'],
        default: 'Unplaced',
      },
      phone: String,
      dob: Date,
      gender: String,
      address: String,
      city: String,
      state: String,
      tenthPercent: Number,
      twelfthPercent: Number,
      projects: [
        {
          title: String,
          description: String,
          technologies: [String],
          link: String,
        }
      ],
      socialLinks: {
        linkedin: String,
        github: String,
        portfolio: String,
      },
    },
    
    // Recruiter specific fields
    recruiterDetails: {
      companyName: String,
      companyWebsite: String,
      companyLogo: String,
      position: String,
      location: String,
      phone: String,
      socialLinks: {
        linkedin: String,
        twitter: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
