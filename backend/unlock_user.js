const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const unlockUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'jasmin.jamadar23@tnu.in';
    const result = await User.updateOne(
      { email },
      { 
        $set: { 
          loginAttempts: 0, 
          lockUntil: undefined 
        } 
      }
    );

    if (result.matchedCount === 0) {
      console.log('User not found');
    } else {
      console.log('User account unlocked successfully');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error unlocking user:', error);
    process.exit(1);
  }
};

unlockUser();
