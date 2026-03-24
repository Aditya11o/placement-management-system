const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const MentorProfile = require('./models/MentorProfile');
const MentorAvailability = require('./models/MentorAvailability');

dotenv.config();

const seedMentors = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pms';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for seeding mentors...');

    // 1. Clear existing mentor data (optional, but good for clean seeding)
    // We don't delete Users entirely to avoid breaking other test accounts, 
    // but we can delete specific mentor profiles and availability.
    await MentorProfile.deleteMany({});
    await MentorAvailability.deleteMany({});
    console.log('Cleared existing mentor profiles and availability.');

    const mentorsToSeed = [
      { name: 'John Smith', email: 'john.smith@pms.com', expertise: ['Technical Interview', 'System Design'] },
      { name: 'Sarah Johnson', email: 'sarah.johnson@pms.com', expertise: ['HR Interview', 'Group Discussion'] },
      { name: 'Amit Patel', email: 'amit.patel@pms.com', expertise: ['Aptitude Prep'] },
      { name: 'Neha Sharma', email: 'neha.sharma@pms.com', expertise: ['Resume Clinic'] }
    ];

    const slots = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '07:00 PM'];
    const today = new Date();
    today.setHours(0,0,0,0);

    for (const mData of mentorsToSeed) {
      // Find or create user
      let user = await User.findOne({ email: mData.email });
      if (!user) {
        user = await User.create({
          name: mData.name,
          email: mData.email,
          password: 'Mentor@123',
          role: 'mentor',
          status: 'active',
          isVerified: true
        });
        console.log(`Created mentor user: ${mData.email}`);
      }

      // Create Profile
      await MentorProfile.create({
        user_id: user._id,
        expertise: mData.expertise,
        available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        available_time_slots: slots,
        mode: 'Online',
        is_active: true
      });
      console.log(`Created MentorProfile for: ${mData.name}`);

      // Seed Availability for next 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Skip Sundays
        if (date.getDay() === 0) continue;

        for (const slot of slots) {
          await MentorAvailability.create({
            mentor_id: user._id,
            date: date,
            time_slot: slot,
            is_booked: false
          });
        }
      }
      console.log(`Seeded 7 days of availability for: ${mData.name}`);
    }

    console.log('Mentor seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding mentors:', error);
    process.exit(1);
  }
};

seedMentors();
