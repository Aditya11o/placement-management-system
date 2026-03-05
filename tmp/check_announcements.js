const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const Announcement = require('../backend/src/models/Announcement');

async function checkAnnouncements() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pms');
        console.log('Connected to MongoDB');

        // Use find() - it will only show non-deleted by default due to plugin
        const announcements = await Announcement.find({});
        console.log(`Found ${announcements.length} ACTIVE announcements:`);
        announcements.forEach(a => {
            console.log(`ID: ${a._id}, Title: ${a.title}, Created At: ${a.created_at}`);
        });

        // Use findWithDeleted() to see EVERYTHING
        const allAnnouncements = await Announcement.findWithDeleted({});
        console.log(`\nFound ${allAnnouncements.length} TOTAL announcements (including soft-deleted):`);
        allAnnouncements.forEach(a => {
            console.log(`ID: ${a._id}, Title: ${a.title}, Deleted At: ${a.deletedAt || 'NOT DELETED'}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkAnnouncements();
