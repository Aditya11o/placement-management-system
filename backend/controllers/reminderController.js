const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');

// @desc    Create a reminder
// @route   POST /api/reminders
// @access  Private (Student)
exports.createReminder = async (req, res, next) => {
  try {
    const { title, date, time, reminderBefore } = req.body;

    const reminder = await Reminder.create({
      student: req.user.id,
      title,
      date,
      time,
      reminderBefore,
    });

    // Create a notification for the reminder creation
    await Notification.create({
      recipient: req.user.id,
      message: `Reminder set: ${title} on ${new Date(date).toLocaleDateString()} at ${time}.`,
      type: 'alert',
      link: '/student/interview-schedule',
    });

    res.status(201).json(reminder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's reminders
// @route   GET /api/reminders/my
// @access  Private (Student)
exports.getMyReminders = async (req, res, next) => {
  try {
    const reminders = await Reminder.find({ student: req.user.id }).sort({ date: 1 });
    res.json(reminders);
  } catch (error) {
    next(error);
  }
};
