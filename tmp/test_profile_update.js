const mongoose = require('mongoose');
const Profile = require('./backend/models/Profile');
const User = require('./backend/models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const testUpdate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const user = await User.findOne({ role: 'student' });
        if (!user) {
            console.log('No student user found to test');
            return;
        }

        console.log('Testing update for user:', user.email);
        
        const profile = await Profile.findOne({ user: user._id });
        if (!profile) {
            console.log('No profile found for user');
            return;
        }

        const studentDetails = {
            ...profile.studentDetails,
            skills: ['React', 'NodeJS', 'Debugging']
        };

        profile.studentDetails = { ...profile.studentDetails, ...studentDetails };
        
        console.log('Attempting to save profile...');
        await profile.save();
        console.log('Success!');

    } catch (err) {
        console.error('FAILED:', err.message);
        if (err.errors) {
            console.error('Validation Errors:', Object.keys(err.errors).map(k => `${k}: ${err.errors[k].message}`));
        }
    } finally {
        await mongoose.connection.close();
    }
};

testUpdate();
