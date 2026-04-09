const express = require('express');
const router = express.Router();
const driveController = require('../controllers/driveController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Publicly readable by authenticated users (Students, Recruiters, Admins, Alumni)
router.route('/')
  .get(driveController.getDrives)
  .post(authorize('admin'), driveController.createDrive); // Only admin can create

router.route('/:id')
  .get(driveController.getDriveById)
  .put(authorize('admin'), driveController.updateDrive) // Only admin can update
  .delete(authorize('admin'), driveController.deleteDrive); // Only admin can delete

module.exports = router;
