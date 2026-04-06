const prisma = require('../utils/prisma');

// @desc    Create a reminder
// @route   POST /api/reminders
// @access  Private (Student)
const createReminder = async (req, res, next) => {
  try {
    const { title, date, time } = req.body;
    const dueDate = new Date(`${date}T${time || '00:00'}`);

    const reminder = await prisma.reminder.create({
      data: {
        userId: req.user.id,
        title,
        dueDate,
      }
    });

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        message: `Reminder set: ${title} on ${dueDate.toLocaleDateString()}`,
        type: 'alert'
      }
    });

    res.status(201).json({ ...reminder, _id: reminder.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's reminders
// @route   GET /api/reminders/my
// @access  Private (Student)
const getMyReminders = async (req, res, next) => {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId: req.user.id },
      orderBy: { dueDate: 'asc' }
    });
    res.json(reminders.map(r => ({ ...r, _id: r.id })));
  } catch (error) {
    next(error);
  }
};

module.exports = { createReminder, getMyReminders };
