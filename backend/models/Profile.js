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
      aptitude_prep_status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started',
      },
      interview_prep_status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started',
      },
      profile_completion: {
        type: Number,
        default: 0,
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
          startDate: String,
          endDate: String
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
    
    // Alumni specific fields
    alumniDetails: {
      company: String,
      designation: String,
      graduationYear: Number,
      expertise: [String],
      isAvailableForMentorship: { type: Boolean, default: true },
      socialLinks: {
        linkedin: String,
        github: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
