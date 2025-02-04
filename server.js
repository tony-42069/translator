require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const stripeRoutes = require('./src/routes/stripeRoutes');

const app = express();
const isDevelopment = process.env.NODE_ENV === 'development';

// Middleware
app.use(express.json());
app.use(cors({
  origin: isDevelopment ? 'http://localhost:3000' : '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'Server is running', mode: process.env.NODE_ENV });
});

// API routes
app.use('/api', stripeRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: isDevelopment ? 'http://localhost:3000' : '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  maxHttpBufferSize: 1e8
});

// Room management
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Room handling
  socket.on('create-room', (roomId) => {
    console.log('Creating room:', roomId);
    rooms.set(roomId, { initiator: socket.id });
    socket.join(roomId);
  });

  socket.on('join-room', (roomId) => {
    console.log('Joining room:', roomId);
    socket.join(roomId);
  });

  // Audio streaming
  socket.on('audio-stream', (data) => {
    const { roomId, audio, language } = data;
    socket.to(roomId).emit('audio-stream', { audio, language });
  });

  // Translation results
  socket.on('translation-result', (data) => {
    const { roomId, originalText, translatedText, targetLanguage } = data;
    socket.to(roomId).emit('translation-result', { originalText, translatedText, targetLanguage });
  });

  // Connection management
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    for (const [roomId, room] of rooms.entries()) {
      if (room.initiator === socket.id) {
        rooms.delete(roomId);
        io.to(roomId).emit('room-closed');
      }
    }
  });
});

// Serve static files only in production
if (!isDevelopment) {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

const SERVER_PORT = process.env.SERVER_PORT || 3001;
server.listen(SERVER_PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${SERVER_PORT}`);
  if (isDevelopment) {
    console.log(`API available at http://localhost:${SERVER_PORT}`);
    console.log('Frontend should be started separately on port 3000');
  }
});
