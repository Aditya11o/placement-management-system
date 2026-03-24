const express = require('express');
const { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead,
  createBroadcast, 
  adminGetNotifications 
} = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getMyNotifications);
router.get('/admin', protect, admin, adminGetNotifications);
router.post('/broadcast', protect, admin, createBroadcast);
router.put('/read/:id', protect, markAsRead);
router.put('/read-all/:userId', protect, markAllAsRead);

module.exports = router;
