const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Ensure we load the .env from the backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const fixNotifications = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pms';
    console.log(`Connecting to: ${mongoURI}`);
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB.');

    // Import model AFTER connection/config
    const Notification = require('./models/Notification');

    const result = await Notification.deleteMany({
      $or: [
        { notification_id: { $exists: false } },
        { notification_id: null }
      ]
    });
    console.log(`Deleted ${result.deletedCount} problematic notifications.`);

    try {
      await Notification.collection.dropIndex('notification_id_1');
      console.log('Dropped notification_id_1 index.');
    } catch (e) {
      console.log('Index drop skip/fail: ' + e.message);
    }

    console.log('Finalizing...');
    await mongoose.connection.close();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('CRITICAL ERROR: ' + error.message);
    process.exit(1);
  }
};

fixNotifications();
