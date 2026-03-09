const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('./src/utils/logger');

// Mock socketManager to avoid errors if it tries to init redis/socket
const socketManager = require('./src/utils/socketManager');
socketManager.notifyUser = (id, event, data) => console.log(`[MOCK SOCKET] Notified ${id}: ${event}`, data);

const Notification = require('./src/models/Notification');
const NotificationPrefs = require('./src/models/NotificationPrefs');
const { dispatchToUser } = require('./src/services/notifyDispatcher');
const Student = require('./src/models/Student');

dotenv.config();

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
    process.exit(1);
});

async function runTest() {
    console.log('Starting test...');
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI not found in .env');
            return;
        }

        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Setup Test User
        let user = await Student.findOne({ email: 'test_intel@example.com' });
        if (!user) {
            user = await Student.create({
                name: 'Intel Test User',
                email: 'test_intel@example.com',
                password: 'password123',
                branch: 'CS',
                cgpa: 9.0,
                graduation_year: 2024,
                phone: '1234567890',
                gender: 'MALE'
            });
            console.log('Created test user');
        } else {
            console.log('Using existing test user');
        }
        const userId = user._id;

        // 2. Setup Prefs with Quiet Hours
        // Current time is ~22:15, so 22:00-08:00 should be active
        let prefs = await NotificationPrefs.getOrCreate(userId, 'Student');
        prefs.quietHours = {
            enabled: true,
            start: '22:00',
            end: '08:00'
        };
        await prefs.save();
        console.log(`Quiet Hours Setup: ${prefs.quietHours.start} - ${prefs.quietHours.end} (Enabled: ${prefs.quietHours.enabled})`);

        // 3. Test Priority Dispatch
        console.log('Dispatching notifications...');

        // Low Priority
        await dispatchToUser({
            recipientId: userId,
            recipientModel: 'Student',
            eventName: 'weekly_digest',
            title: 'Weekly Wrap',
            message: 'Low priority item',
            type: 'INFO'
        });

        // Medium Priority
        await dispatchToUser({
            recipientId: userId,
            recipientModel: 'Student',
            eventName: 'new_announcement',
            title: 'New Policy',
            message: 'Medium priority item',
            type: 'INFO'
        });

        // High Priority
        await dispatchToUser({
            recipientId: userId,
            recipientModel: 'Student',
            eventName: 'interview_scheduled',
            title: 'Interview Alert',
            message: 'High priority item',
            type: 'SUCCESS'
        });

        // 4. Verify DB Ordering
        const notifications = await Notification.find({ recipientId: userId })
            .sort({ priority: -1, createdAt: -1 })
            .limit(3);

        console.log('\n--- DB Order Verification ---');
        notifications.forEach(n => {
            console.log(`[Priority ${n.priority}] ${n.title}: ${n.message}`);
        });

        if (notifications[0].priority === 10) {
            console.log('✅ Priority sorting verified!');
        } else {
            console.log('❌ Priority sorting failed!');
        }

        console.log('\n--- Quiet Hours Verification ---');
        console.log('Note: Look at logs above for [notifyDispatcher] suppression messages.');

        await mongoose.disconnect();
        console.log('Finished.');
    } catch (err) {
        console.error('CRITICAL ERROR in runTest:', err);
    }
}

runTest();
