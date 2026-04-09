const express = require('express');
const {
  createEvent,
  getCalendarEvents,
  deleteEvent,
  updateEvent,
} = require('../controllers/academicEventController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Publicly accessible calendar viewing (Authenticated users only)
router.get('/', protect, getCalendarEvents);

// Admin-only management routes
router.use(protect);
router.use(authorize('admin'));

router.post('/events', createEvent);
router.route('/events/:id')
  .put(updateEvent)
  .delete(deleteEvent);

module.exports = router;
