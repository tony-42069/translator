import io from 'socket.io-client';
import AudioService from './AudioService';
import TranslationService from './TranslationService';

class SocketService {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.isConnected = false;
    this.onAudioReceived = null;
    this.onTranslationReceived = null;
  }

  connect() {
    this.socket = io(process.env.REACT_APP_SERVER_URL);
    this.setupEventListeners();
    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        this.isConnected = true;
        resolve();
      });
      this.socket.on('connect_error', (error) => {
        reject(error);
      });
    });
  }

  setupEventListeners() {
    this.socket.on('audio-stream', async (data) => {
      const { audio, language, userId } = data;
      if (this.onAudioReceived) {
        this.onAudioReceived(audio, language, userId);
      }
    });

    this.socket.on('translation-result', (data) => {
      if (this.onTranslationReceived) {
        this.onTranslationReceived(data);
      }
    });

    this.socket.on('room-closed', () => {
      this.leaveRoom();
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });
  }

  async createRoom() {
    if (!this.isConnected) {
      throw new Error('Socket not connected');
    }
    this.roomId = `room_${Date.now()}`;
    this.socket.emit('create-room', this.roomId);
    return this.roomId;
  }

  async joinRoom(roomId) {
    if (!this.isConnected) {
      throw new Error('Socket not connected');
    }
    this.roomId = roomId;
    this.socket.emit('join-room', roomId);
  }

  async startStreaming() {
    if (!this.roomId) {
      throw new Error('Not in a room');
    }

    await AudioService.initializeStream();
    AudioService.startProcessing((audioData) => {
      if (this.roomId && this.isConnected) {
        this.socket.emit('audio-stream', {
          roomId: this.roomId,
          audio: audioData,
          language: TranslationService.currentLanguage
        });
      }
    });
  }

  leaveRoom() {
    if (this.roomId) {
      this.socket.emit('leave-room', this.roomId);
      this.roomId = null;
    }
    AudioService.stopProcessing();
  }

  disconnect() {
    this.leaveRoom();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  setAudioReceivedCallback(callback) {
    this.onAudioReceived = callback;
  }

  setTranslationReceivedCallback(callback) {
    this.onTranslationReceived = callback;
  }
}

export default new SocketService(); 