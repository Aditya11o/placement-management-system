const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    student_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile_photo: {
      type: String,
    },
    date_of_birth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
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
    course: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    tenth_marks: {
      type: Number,
      required: true,
    },
    twelfth_marks: {
      type: Number,
      required: true,
    },
    passing_year: {
      type: Number,
      required: true,
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
        link: String,
      },
    ],
    resume: {
      type: String, // URL
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    placement_status: {
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
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

module.exports = StudentProfile;
