const express = require('express');
const { getStats, getUsers, verifyUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/users', protect, authorize('admin'), getUsers);
router.patch('/users/:id/verify', protect, authorize('admin'), verifyUser);

module.exports = router;
