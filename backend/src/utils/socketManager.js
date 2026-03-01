const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

let io;

// Multi-socket-per-user support: Map<userId, Set<socketId>>
// One user logged into 2 tabs will have 2 socket IDs in the Set.
const connectedUsers = new Map();

function initializeSocket(httpServer) {
    if (process.env.NODE_ENV === 'test') {
        logger.info('[TEST MOCK] Socket.io bypassed for testing');
        return;
    }

    const whitelist = process.env.CORS_WHITELIST
        ? process.env.CORS_WHITELIST.split(',')
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'];

    io = new Server(httpServer, {
        cors: {
            origin: whitelist,
            methods: ['GET', 'POST']
        }
    });

    // ── JWT Authentication Middleware for WebSockets ──────────────────────────
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];

        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }

        try {
            const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;
            const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    // ── Connection Lifecycle ──────────────────────────────────────────────────
    io.on('connection', (socket) => {
        const userId = socket.user.id;
        const role = socket.user.role;

        logger.info(`[Socket.io] Connected: ${userId} (Role: ${role}, Socket: ${socket.id})`);

        // Register socket — support multiple sockets per user (multi-tab)
        if (!connectedUsers.has(userId)) {
            connectedUsers.set(userId, new Set());
        }
        connectedUsers.get(userId).add(socket.id);

        // Join role room for broadcasts (e.g. 'role_STUDENT', 'role_RECRUITER')
        socket.join(`role_${role}`);

        // Emit a confirmation event so the client knows the connection is auth'd
        socket.emit('connected', {
            message: 'Socket authenticated successfully',
            userId,
            role,
            timestamp: new Date()
        });

        socket.on('disconnect', (reason) => {
            const userSockets = connectedUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                // Clean up the map entry if no sockets remain
                if (userSockets.size === 0) {
                    connectedUsers.delete(userId);
                }
            }
            logger.info(`[Socket.io] Disconnected: ${userId} (Reason: ${reason})`);
        });
    });

    logger.info('[Socket.io] Real-time notification dispatcher initialized');
    return io;
}

// ── Targeted Push: deliver to ALL sockets of a specific user ─────────────────
const notifyUser = (userId, eventName, payload) => {
    if (process.env.NODE_ENV === 'test') {
        logger.info(`[TEST MOCK] notifyUser → ${eventName} → ${userId}`);
        return;
    }
    if (!io) return;

    const userSockets = connectedUsers.get(userId.toString());
    if (userSockets && userSockets.size > 0) {
        userSockets.forEach((socketId) => {
            io.to(socketId).emit(eventName, payload);
        });
        logger.info(`[Socket.io] Pushed '${eventName}' to user ${userId} (${userSockets.size} socket(s))`);
    }
};

// ── Role Broadcast: deliver to all users in a role room ──────────────────────
const notifyRole = (role, eventName, payload) => {
    if (process.env.NODE_ENV === 'test') {
        logger.info(`[TEST MOCK] notifyRole → ${eventName} → role_${role}`);
        return;
    }
    if (!io) return;

    io.to(`role_${role}`).emit(eventName, payload);
    logger.info(`[Socket.io] Broadcast '${eventName}' to role_${role}`);
};

// ── Global Broadcast: deliver to every connected socket ──────────────────────
const notifyAll = (eventName, payload) => {
    if (process.env.NODE_ENV === 'test') {
        logger.info(`[TEST MOCK] notifyAll → ${eventName}`);
        return;
    }
    if (!io) return;

    io.emit(eventName, payload);
    logger.info(`[Socket.io] Broadcast '${eventName}' globally`);
};

// ── Diagnostic Utility ───────────────────────────────────────────────────────
const getConnectedCount = () => connectedUsers.size;

module.exports = {
    initializeSocket,
    notifyUser,
    notifyRole,
    notifyAll,
    getConnectedCount
};
