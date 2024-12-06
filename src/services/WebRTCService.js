// src/services/WebRTCService.js
import SimplePeer from 'simple-peer';

class WebRTCService {
  constructor() {
    this.peer = null;
    this.stream = null;
    this.onConnectionCallback = null;
    this.onDataCallback = null;
    this.onStreamCallback = null;
    this.onErrorCallback = null;
    this.isConnected = false;
    this.pendingCandidates = [];
  }

  async initialize(initiator = false) {
    try {
      console.log(`🎯 Initializing as ${initiator ? 'initiator' : 'joiner'}`);
      
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false
      });
      console.log('🎤 Got audio stream');

      return new Promise((resolve) => {
        this.peer = new SimplePeer({
          initiator,
          stream: this.stream,
          trickle: false,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              {
                urls: 'turn:numb.viagenie.ca',
                username: 'webrtc@live.com',
                credential: 'muazkh'
              }
            ]
          }
        });

        // Set up event handlers
        this.peer.on('signal', data => {
          console.log('📡 Generated signal:', data.type);
          if (this.onConnectionCallback) {
            this.onConnectionCallback(JSON.stringify(data));
          }
        });

        this.peer.on('connect', () => {
          console.log('🌟 Peer connection established!');
          this.isConnected = true;
          if (this.onDataCallback) {
            this.onDataCallback(JSON.stringify({
              type: 'connected',
              message: 'Connection established'
            }));
          }
          // Send test data to verify connection
          this.peer.send(JSON.stringify({ type: 'test', message: 'Testing connection' }));
        });

        this.peer.on('data', data => {
          console.log('📩 Received data:', data.toString());
          if (this.onDataCallback) {
            this.onDataCallback(data.toString());
          }
        });

        this.peer.on('stream', stream => {
          console.log('🔊 Received remote audio stream');
          if (this.onStreamCallback) {
            this.onStreamCallback(stream);
          }
        });

        this.peer.on('error', error => {
          console.error('❌ Peer error:', error);
          this.handleError(error);
        });

        this.peer.on('close', () => {
          console.log('👋 Connection closed');
          this.isConnected = false;
          if (this.onDataCallback) {
            this.onDataCallback(JSON.stringify({ type: 'disconnected' }));
          }
        });

        // Add debugging for connection state changes
        if (this.peer._pc) {
          this.peer._pc.onconnectionstatechange = () => {
            console.log('📊 Connection state:', this.peer._pc.connectionState);
          };

          this.peer._pc.oniceconnectionstatechange = () => {
            console.log('🧊 ICE connection state:', this.peer._pc.iceConnectionState);
          };

          this.peer._pc.onicegatheringstatechange = () => {
            console.log('❄️ ICE gathering state:', this.peer._pc.iceGatheringState);
          };
        }

        resolve(true);
      });
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      this.handleError(error);
      return false;
    }
  }

  async connect(signalData) {
    try {
      if (!this.peer) {
        throw new Error('Peer not initialized');
      }

      console.log('🔄 Processing connection data...');
      const signal = JSON.parse(signalData);
      
      console.log(`📥 Received signal: ${signal.type}`);
      this.peer.signal(signal);
      
      return true;
    } catch (error) {
      console.error('❌ Connection attempt failed:', error);
      this.handleError(error);
      return false;
    }
  }

  handleError(error) {
    console.error('❌ WebRTC error:', error);
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  sendData(data) {
    try {
      if (this.peer && this.peer.connected) {
        this.peer.send(JSON.stringify(data));
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to send data:', error);
      return false;
    }
  }

  cleanup() {
    console.log('🧹 Starting cleanup...');
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        console.log('🎤 Stopped audio track');
      });
    }

    if (this.peer) {
      this.peer.destroy();
      console.log('🔌 Destroyed peer connection');
    }

    this.stream = null;
    this.peer = null;
    this.isConnected = false;
    this.pendingCandidates = [];
    
    console.log('✨ Cleanup complete');
  }

  setCallbacks(onConnection, onData, onStream, onError) {
    this.onConnectionCallback = onConnection;
    this.onDataCallback = onData;
    this.onStreamCallback = onStream;
    this.onErrorCallback = onError;
  }

  isCallActive() {
    return this.isConnected && this.peer && this.peer.connected;
  }
}

const webRTCService = new WebRTCService();
export default webRTCService;