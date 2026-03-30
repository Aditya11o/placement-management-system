const express = require('express');
const { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead,
  getAnnouncements,
  adminGetBroadcasts,
  updateBroadcast,
  deleteBroadcast,
  createBroadcast
} = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getMyNotifications);
router.get('/announcements', protect, getAnnouncements);
router.get('/admin', protect, admin, adminGetBroadcasts);
router.post('/broadcast', protect, admin, createBroadcast);
router.put('/broadcast/:id', protect, admin, updateBroadcast);
router.delete('/broadcast/:id', protect, admin, deleteBroadcast);
router.put('/read/:id', protect, markAsRead);
router.put('/read-all/:userId', protect, markAllAsRead);

module.exports = router;
