const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-call', (callId) => {
    console.log(`User ${socket.id} joining call ${callId}`);
    socket.join(callId);
    connectedUsers.set(socket.id, callId);
    
    // Notify others in the call
    socket.to(callId).emit('user-joined', socket.id);
  });

  socket.on('audio-data', (data) => {
    const callId = connectedUsers.get(socket.id);
    if (callId) {
      // Broadcast audio data to others in the same call
      socket.to(callId).emit('audio-data', {
        userId: socket.id,
        audioData: data.audioData,
        language: data.language
      });
    }
  });

  socket.on('translation-result', (data) => {
    const callId = connectedUsers.get(socket.id);
    if (callId) {
      // Broadcast translation to others in the same call
      socket.to(callId).emit('translation-result', {
        userId: socket.id,
        originalText: data.originalText,
        translatedText: data.translatedText,
        language: data.language
      });
    }
  });

  socket.on('disconnect', () => {
    const callId = connectedUsers.get(socket.id);
    if (callId) {
      socket.to(callId).emit('user-left', socket.id);
      connectedUsers.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
