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
      resume: String, // Cloudinary URL
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
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
