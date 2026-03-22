const express = require('express');
const { getResources, createResource, deleteResource } = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, getResources)
  .post(protect, authorize('admin'), createResource);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteResource);

module.exports = router;
