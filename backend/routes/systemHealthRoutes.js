const express = require('express');
const router = express.Router();
const { getSystemHealth } = require('../controllers/systemHealthController');
const { protect, admin, authorizeLevel } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/admin/health/system
 * @desc    Get detailed system health metrics for Super Admins
 * @access  Private (Super Admin Only)
 */
router.get(
  '/system',
  protect,
  admin,
  authorizeLevel('SUPER_ADMIN'),
  getSystemHealth
);

module.exports = router;
