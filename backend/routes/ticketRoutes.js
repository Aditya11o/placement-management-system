const express = require('express');
const router = express.Router();
const { createTicket, getTickets, updateTicket } = require('../controllers/ticketController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .post(protect, upload.single('screenshot'), createTicket)
  .get(protect, getTickets);

router.route('/:id')
  .patch(protect, admin, updateTicket);

module.exports = router;
