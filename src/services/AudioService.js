class AudioService {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.processor = null;
    this.stream = null;
  }

  async initializeStream() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(1024, 1, 1);
      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      return this.stream;
    } catch (error) {
      console.error('Error initializing audio stream:', error);
      throw error;
    }
  }

  startProcessing(onAudioData) {
    if (!this.processor) {
      throw new Error('Audio processor not initialized. Call initializeStream() first.');
    }
    
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      onAudioData(inputData);
    };
  }

  stopProcessing() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  // Helper method to check if audio is initialized
  isInitialized() {
    return this.processor !== null && this.stream !== null;
  }
}

export default new AudioService(); 