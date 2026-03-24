const express = require('express');
const { createReminder, getMyReminders } = require('../controllers/reminderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.post('/', createReminder);
router.get('/my', getMyReminders);

module.exports = router;
