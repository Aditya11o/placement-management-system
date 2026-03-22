const express = require('express');
const { 
  getMyNotifications, 
  markAsRead, 
  createBroadcast, 
  adminGetNotifications 
} = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getMyNotifications);
router.get('/admin', protect, admin, adminGetNotifications);
router.post('/broadcast', protect, admin, createBroadcast);
router.patch('/:id/read', protect, markAsRead);

module.exports = router;
