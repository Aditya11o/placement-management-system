const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const MentorProfile = require('./models/MentorProfile');
const MentorAvailability = require('./models/MentorAvailability');

dotenv.config();

const verify = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pms';
    await mongoose.connect(mongoURI);
    
    const mentorCount = await User.countDocuments({ role: 'mentor' });
    const profileCount = await MentorProfile.countDocuments({});
    const availabilityCount = await MentorAvailability.countDocuments({});
    
    // Write results to a file since stdout is not captured
    const fs = require('fs');
    fs.writeFileSync('verify_results.txt', `Mentors: ${mentorCount}\nProfiles: ${profileCount}\nAvailability: ${availabilityCount}\n`);
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

verify();
