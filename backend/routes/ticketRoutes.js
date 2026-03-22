const express = require('express');
const router = express.Router();
const { createTicket, getTickets, updateTicket } = require('../controllers/ticketController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createTicket)
  .get(protect, getTickets);

router.route('/:id')
  .patch(protect, admin, updateTicket);

module.exports = router;
