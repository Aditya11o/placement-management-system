const express = require('express');
const {
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
    markAnnouncementRead,
    getAnnouncementStats
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { cache } = require('../middlewares/cacheMiddleware');
const { validate } = require('../middlewares/validate');
const { validateAnnouncementCreation } = require('../validations/announcementValidator');

const router = express.Router();

router.use(protect);

router.get('/', cache(300), getAnnouncements);
router.post('/', authorize('ADMIN'), validateAnnouncementCreation, validate, createAnnouncement);

// Mark an announcement as read (Student/Recruiter)
router.patch('/:id/read', markAnnouncementRead);

// Get stats for an announcement (Admin only)
router.get('/:id/stats', authorize('ADMIN'), getAnnouncementStats);

router.delete('/:id', authorize('ADMIN'), deleteAnnouncement);

module.exports = router;
