const express = require('express');
const { globalSearch } = require('../controllers/searchController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected search endpoint — initially for Admins, but can be scaled for Rec/Stu
router.get('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), globalSearch);

module.exports = router;
