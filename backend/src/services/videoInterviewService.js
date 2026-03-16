const logger = require('../utils/logger');
const Interview = require('../models/Interview');

/**
 * Signaling service for Real-time Video Interviews (WebRTC)
 */
const handleSignaling = (socket, io, connectedUsers) => {
    
    // ── Join Interview Room ──────────────────────────────────────────────────
    socket.on('interview:join_room', async (payload) => {
        try {
            const { roomId } = payload;
            if (!roomId) return;

            // Verify if the user is authorized for this room
            const interview = await Interview.findOne({ 
                internal_room_id: roomId,
                $or: [
                    { recruiter_id: socket.user.id },
                    { student_id: socket.user.id }
                ]
            });

            if (!interview) {
                socket.emit('interview:error', { message: 'Not authorized for this room' });
                return;
            }

            const roomName = `interview_${roomId}`;
            socket.join(roomName);
            
            // Log session start if it's the first time
            if (!interview.session_start_actual) {
                interview.session_start_actual = new Date();
                await interview.save();
            }

            // Notify others in the room
            socket.to(roomName).emit('interview:peer_joined', {
                userId: socket.user.id,
                role: socket.user.role,
                socketId: socket.id
            });

            logger.info(`[Socket.io] User ${socket.user.id} joined interview room: ${roomId}`);
        } catch (err) {
            logger.error('[Socket.io] interview:join_room error:', err);
        }
    });

    // ── WebRTC Signaling Connectors ───────────────────────────────────────────
    
    socket.on('interview:offer', (payload) => {
        const { targetSocketId, offer } = payload;
        io.to(targetSocketId).emit('interview:offer', {
            senderSocketId: socket.id,
            offer
        });
    });

    socket.on('interview:answer', (payload) => {
        const { targetSocketId, answer } = payload;
        io.to(targetSocketId).emit('interview:answer', {
            senderSocketId: socket.id,
            answer
        });
    });

    socket.on('interview:ice_candidate', (payload) => {
        const { targetSocketId, candidate } = payload;
        io.to(targetSocketId).emit('interview:ice_candidate', {
            senderSocketId: socket.id,
            candidate
        });
    });

    // ── Media Controls Sync (Optional UI feedback) ────────────────────────────
    socket.on('interview:control_update', (payload) => {
        const { roomId, controls } = payload; // controls: { audio: bool, video: bool }
        const roomName = `interview_${roomId}`;
        socket.to(roomName).emit('interview:peer_control_update', {
            userId: socket.user.id,
            controls
        });
    });

    // ── Session Termination ───────────────────────────────────────────────────
    socket.on('interview:end_session', async (payload) => {
        const { roomId } = payload;
        const roomName = `interview_${roomId}`;

        try {
            const interview = await Interview.findOne({ internal_room_id: roomId });
            if (interview && !interview.session_end_actual) {
                interview.session_end_actual = new Date();
                interview.status = 'COMPLETED';
                await interview.save();
            }

            io.to(roomName).emit('interview:session_ended', {
                endedBy: socket.user.id,
                timestamp: new Date()
            });
        } catch (err) {
            logger.error('[Socket.io] interview:end_session error:', err);
        }
    });
};

module.exports = { handleSignaling };
