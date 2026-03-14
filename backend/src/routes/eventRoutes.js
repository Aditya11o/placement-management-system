const express = require('express');
const { 
    getEvents, 
    createEvent, 
    joinEvent, 
    deleteEvent 
} = require('../controllers/eventController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getEvents);
router.post('/', authorize('ADMIN', 'RECRUITER'), createEvent);
router.post('/:id/join', authorize('STUDENT'), joinEvent);
router.delete('/:id', authorize('ADMIN'), deleteEvent);

module.exports = router;
