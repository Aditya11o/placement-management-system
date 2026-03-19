const express = require('express');
const { 
    getStudentProfile, updateStudentProfile, getStudents, inviteStudent, 
    getReadinessScore, getAlumniDirectory, getCareerAnalytics, updatePortfolioTheme,
    getOnlinePeers, getPlacementPredictor, sendManualNudge
} = require('../controllers/studentController');
const { createRoom, getRooms, getRoomById, joinRoom } = require('../controllers/prepRoomController');
const { initiatePeerChat, getPeerConversations, sendPeerMessage, getPeerMessages } = require('../controllers/peerChatController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const advancedResults = require('../middlewares/advancedResults');
const Student = require('../models/Student');

const router = express.Router();

// All routes are protected
router.use(protect);

/**
 * @desc Get all students (Recruiters/Admins)
 */
router.get('/', authorize('RECRUITER', 'ADMIN'), advancedResults(Student), getStudents);

/**
 * @desc Invite student (Recruiters only)
 */
router.post('/:id/invite', authorize('RECRUITER'), inviteStudent);
router.post('/:id/nudge', authorize('ADMIN'), sendManualNudge);

/**
 * @desc Get logged-in student profile (Student only)
 */
router.get('/profile', authorize('STUDENT'), getStudentProfile);

/**
 * @desc Update student profile (Student only)
 */
router.put('/profile', authorize('STUDENT'), updateStudentProfile);

/**
 * @desc Get student readiness score (Student only)
 */
router.get('/readiness-score', authorize('STUDENT'), getReadinessScore);

/**
 * @desc Get career analytics (Student only)
 */
router.get('/career-analytics', authorize('STUDENT'), getCareerAnalytics);

/**
 * @desc Update portfolio theme (Student only)
 */
router.put('/portfolio-theme', authorize('STUDENT'), updatePortfolioTheme);

/**
 * @desc Get currently online peers (Student only)
 */
router.get('/online-peers', authorize('STUDENT'), getOnlinePeers);

/**
 * @desc Placement Predictor (Student only)
 */
router.get('/placement-predictor', authorize('STUDENT'), getPlacementPredictor);

/**
 * @desc Prep Rooms (Student only)
 */
router.post('/prep-rooms', authorize('STUDENT'), createRoom);
router.get('/prep-rooms', authorize('STUDENT'), getRooms);
router.get('/prep-rooms/:id', authorize('STUDENT'), getRoomById);
router.post('/prep-rooms/:id/join', authorize('STUDENT'), joinRoom);

/**
 * @desc Alumni Directory (Student only)
 */
router.get('/alumni', authorize('STUDENT'), getAlumniDirectory);

/**
 * @desc Peer Chat (Student only)
 */
router.post('/peer-chat/initiate', authorize('STUDENT'), initiatePeerChat);
router.get('/peer-chat/conversations', authorize('STUDENT'), getPeerConversations);
router.get('/peer-chat/conversations/:id/messages', authorize('STUDENT'), getPeerMessages);
router.post('/peer-chat/conversations/:id/messages', authorize('STUDENT'), sendPeerMessage);

module.exports = router;
