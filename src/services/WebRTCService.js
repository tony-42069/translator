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
    this.onConnectedCallback = null;
    this.isConnected = false;
    this.pendingCandidates = [];
  }

  async initialize(initiator = true) {
    try {
      console.log(`🎯 Initializing as ${initiator ? 'initiator' : 'joiner'}`);
      
      // Get audio stream
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('🎤 Got audio stream');

      // Initialize peer with ICE servers
      this.peer = new SimplePeer({
        initiator,
        stream: this.stream,
        trickle: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            {
              urls: 'turn:a.relay.metered.ca:80',
              username: '83eebabf8b4cce8ed1b3a84a',
              credential: 'uGOKT6HPQQXMrZJv',
            },
            {
              urls: 'turn:a.relay.metered.ca:443',
              username: '83eebabf8b4cce8ed1b3a84a',
              credential: 'uGOKT6HPQQXMrZJv',
            },
            {
              urls: 'turn:a.relay.metered.ca:443?transport=tcp',
              username: '83eebabf8b4cce8ed1b3a84a',
              credential: 'uGOKT6HPQQXMrZJv',
            },
            {
              urls: 'turn:openrelay.metered.ca:80',
              username: 'openrelayproject',
              credential: 'openrelayproject',
            },
            {
              urls: 'turn:openrelay.metered.ca:443',
              username: 'openrelayproject',
              credential: 'openrelayproject',
            }
          ],
          iceCandidatePoolSize: 10,
          iceTransportPolicy: 'all'
        },
        sdpTransform: (sdp) => {
          // Add additional codec support
          return sdp.replace('useinbandfec=1', 'useinbandfec=1; stereo=1; maxaveragebitrate=510000');
        }
      });

      // Set up peer event handlers
      this.peer.on('error', this.handleError.bind(this));
      this.peer.on('signal', this.handleSignal.bind(this));
      this.peer.on('connect', () => {
        console.log('🔗 Peer connection established!');
        this.isConnected = true;
        if (this.onConnectedCallback) this.onConnectedCallback();
      });
      this.peer.on('data', this.handleData.bind(this));
      this.peer.on('stream', this.handleStream.bind(this));
      this.peer.on('close', this.cleanup.bind(this));

      return true;
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
      
      return new Promise((resolve, reject) => {
        let connectionTimeout;
        let retryCount = 0;
        const maxRetries = 3;
        
        const cleanup = () => {
          if (connectionTimeout) clearTimeout(connectionTimeout);
          this.peer.removeListener('connect', handleConnect);
          this.peer.removeListener('error', handleError);
        };

        const handleConnect = () => {
          console.log('✅ Connection successful!');
          cleanup();
          resolve(true);
        };

        const handleError = (err) => {
          console.error('❌ Connection error:', err);
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying connection (attempt ${retryCount}/${maxRetries})...`);
            // Re-process the signal
            this.peer.signal(signal);
          } else {
            cleanup();
            reject(err);
          }
        };

        // Set connection timeout (30 seconds total including retries)
        connectionTimeout = setTimeout(() => {
          cleanup();
          reject(new Error('Connection timeout - this could be due to NAT/firewall restrictions. Please check your firewall settings and try again.'));
        }, 30000);

        // Add temporary event listeners
        this.peer.once('connect', handleConnect);
        this.peer.on('error', handleError);

        // Process the signal
        this.peer.signal(signal);
      });
    } catch (error) {
      console.error('❌ Connection attempt failed:', error);
      this.handleError(error);
      throw error;
    }
  }

  handleSignal(data) {
    console.log('📡 Generated signal:', data.type);
    if (this.onConnectionCallback) {
      this.onConnectionCallback(JSON.stringify(data));
    }
  }

  handleData(data) {
    console.log('📩 Received data:', data.toString());
    if (this.onDataCallback) {
      this.onDataCallback(data.toString());
    }
  }

  handleStream(stream) {
    console.log('🔊 Received remote audio stream');
    if (this.onStreamCallback) {
      this.onStreamCallback(stream);
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

  setCallbacks(onConnection, onData, onStream, onError, onConnected) {
    this.onConnectionCallback = onConnection;
    this.onDataCallback = onData;
    this.onStreamCallback = onStream;
    this.onErrorCallback = onError;
    this.onConnectedCallback = onConnected;
  }

  isCallActive() {
    return this.isConnected && this.peer && this.peer.connected;
  }
}

const webRTCService = new WebRTCService();
export default webRTCService;