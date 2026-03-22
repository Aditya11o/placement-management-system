const express = require('express');
const { getMessages, sendMessage, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/:otherUserId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;
