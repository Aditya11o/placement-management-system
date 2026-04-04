require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { initCron } = require('./utils/cron');
const app = require('./app');

// Fail-fast: ensure critical secrets are configured
if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  console.error('FATAL: JWT_SECRET and REFRESH_TOKEN_SECRET must be set in .env');
  process.exit(1);
}

// Connect to database
connectDB();

// Initialize Cron Jobs
initCron();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  },
});

// Make io accessible to our routers/controllers
app.set('io', io);

// Socket.io authentication middleware
io.use((socket, next) => {
  // Try auth header first, then query, then cookie
  let token = socket.handshake.auth?.token || socket.handshake.query?.token;
  
  // Fallback: parse token from cookies in handshake headers
  if (!token && socket.handshake.headers.cookie) {
    const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, c) => {
      const [key, val] = c.trim().split('=');
      if (key && val) acc[key] = decodeURIComponent(val);
      return acc;
    }, {});
    token = cookies.token;
  }
  
  if (!token) {
    return next(new Error('Authentication required'));
  }
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    return next(new Error('Invalid token'));
  }
});

// Socket.io connection (authenticated)
io.on('connection', (socket) => {
  console.log('Authenticated user connected:', socket.userId, socket.id);

  // Auto-join the user to their own private room
  socket.join(socket.userId.toString());

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
