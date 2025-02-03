const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  maxHttpBufferSize: 1e8
});

// Room and user management
const rooms = new Map();
const userLanguages = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Room creation
  socket.on('create-room', (roomId) => {
    console.log(`Creating room: ${roomId}`);
    rooms.set(roomId, { 
      initiator: socket.id,
      users: new Set([socket.id])
    });
    socket.join(roomId);
    socket.emit('room-created', roomId);
  });

  // Room joining
  socket.on('join-room', (roomId) => {
    console.log(`User ${socket.id} joining room ${roomId}`);
    const room = rooms.get(roomId);
    if (room) {
      room.users.add(socket.id);
      socket.join(roomId);
      socket.emit('room-joined', roomId);
      socket.to(roomId).emit('user-joined', socket.id);
    } else {
      socket.emit('error', { message: 'Room not found' });
    }
  });

  // Audio streaming
  socket.on('audio-stream', (data) => {
    const { roomId, audio, language } = data;
    const room = rooms.get(roomId);
    if (room && room.users.has(socket.id)) {
      userLanguages.set(socket.id, language);
      socket.to(roomId).emit('audio-stream', {
        audio,
        language,
        userId: socket.id
      });
    }
  });

  // Translation results
  socket.on('translation-result', (data) => {
    const { roomId, originalText, translatedText, targetLanguage } = data;
    const room = rooms.get(roomId);
    if (room && room.users.has(socket.id)) {
      socket.to(roomId).emit('translation-result', {
        userId: socket.id,
        originalText,
        translatedText,
        targetLanguage
      });
    }
  });

  // Room leaving
  socket.on('leave-room', (roomId) => {
    handleUserLeaving(socket, roomId);
  });

  // Disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Clean up all rooms the user was in
    for (const [roomId, room] of rooms.entries()) {
      if (room.users.has(socket.id)) {
        handleUserLeaving(socket, roomId);
      }
    }
    userLanguages.delete(socket.id);
  });
});

function handleUserLeaving(socket, roomId) {
  const room = rooms.get(roomId);
  if (room) {
    room.users.delete(socket.id);
    socket.to(roomId).emit('user-left', socket.id);
    
    // If room is empty or initiator left, close the room
    if (room.users.size === 0 || room.initiator === socket.id) {
      rooms.delete(roomId);
      io.to(roomId).emit('room-closed');
    }
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
