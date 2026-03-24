const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    department: {
      type: String,
    },
    course: {
      type: String,
    },
    passing_year: {
      type: Number,
    },
    current_cgpa: {
      type: Number,
    },
    tenth_percentage: {
      type: Number,
    },
    twelfth_percentage: {
      type: Number,
    },
    linkedin: {
      type: String,
    },
    github: {
      type: String,
    },
    portfolio: {
      type: String,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        link: String,
        start_date: Date,
        end_date: Date,
      },
    ],
    resume_path: {
      type: String,
    },
    profile_photo: {
      type: String,
    },
    profile_completion: {
      type: Number,
      default: 0,
    },
    // Maintain placement related fields for dashboard functionality
    placement_status: {
      type: String,
      enum: ['Unplaced', 'Placed', 'Interned'],
      default: 'Unplaced',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

studentProfileSchema.pre('save', function() {
  const fields = [
    'full_name', 'phone', 'dob', 'gender', 'address', 
    'city', 'state', 'department', 'course', 'passing_year', 
    'current_cgpa', 'tenth_percentage', 'twelfth_percentage', 
    'linkedin', 'github', 'portfolio', 'skills', 
    'projects', 'resume_path', 'profile_photo'
  ];
  
  let filledCount = 0;
  fields.forEach(field => {
    let value = this[field];
    const isFilled = value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0);
    if (isFilled) filledCount++;
  });

  this.profile_completion = Math.round((filledCount / fields.length) * 100);
});

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

module.exports = StudentProfile;
