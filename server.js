require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const stripeRoutes = require('./src/routes/stripeRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', stripeRoutes);

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
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

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
