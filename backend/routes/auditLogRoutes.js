const express = require('express');
const router = express.Router();
const { getAuditLogs, getMyAuditLogs } = require('../controllers/auditLogController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getAuditLogs);
router.get('/my', protect, getMyAuditLogs);

module.exports = router;
