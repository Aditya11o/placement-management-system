const express = require('express');
const router = express.Router();
const { getCompanyDetails, getTeamMembers, updateMemberRole } = require('../controllers/teamController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(authorize('RECRUITER'));

router.get('/company', getCompanyDetails);
router.get('/members', getTeamMembers);
router.put('/members/:id/role', updateMemberRole);

module.exports = router;
