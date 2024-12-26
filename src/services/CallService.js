import io from 'socket.io-client';
import TranslationService from './TranslationService';

class CallService {
    constructor() {
        this.socket = null;
        this.stream = null;
        this.isConnected = false;
        this.currentCallId = null;
        this.onCallDataCallback = null;
        this.onUserJoinedCallback = null;
        this.onUserLeftCallback = null;
        this.mediaRecorder = null;
        this.translationService = TranslationService;
    }

    initialize() {
        this.socket = io('http://localhost:3001');
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.isConnected = true;
        });

        this.socket.on('user-joined', (userId) => {
            console.log('User joined:', userId);
            if (this.onUserJoinedCallback) {
                this.onUserJoinedCallback(userId);
            }
        });

        this.socket.on('user-left', (userId) => {
            console.log('User left:', userId);
            if (this.onUserLeftCallback) {
                this.onUserLeftCallback(userId);
            }
        });

        this.socket.on('audio-data', async (data) => {
            try {
                // Convert audio data to text using speech recognition
                const text = await this.translationService.recognizeAudio(data.audioData);
                
                // Translate the text
                const translatedText = await this.translationService.translate(
                    text,
                    data.language === 'sq-AL' ? 'sq' : 'en',
                    data.language === 'sq-AL' ? 'en' : 'sq'
                );

                // Emit translation result
                this.socket.emit('translation-result', {
                    originalText: text,
                    translatedText: translatedText,
                    language: data.language
                });

                if (this.onCallDataCallback) {
                    this.onCallDataCallback(text, translatedText);
                }
            } catch (error) {
                console.error('Error processing audio:', error);
            }
        });

        this.socket.on('translation-result', (data) => {
            if (this.onCallDataCallback) {
                this.onCallDataCallback(data.originalText, data.translatedText);
            }
        });
    }

    async startCall(callId) {
        if (!this.socket) {
            this.initialize();
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.currentCallId = callId;
            this.socket.emit('join-call', callId);

            // Set up MediaRecorder for audio streaming
            this.mediaRecorder = new MediaRecorder(this.stream);
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    // Convert blob to base64 and send
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        this.socket.emit('audio-data', {
                            audioData: reader.result,
                            language: this.translationService.currentLanguage
                        });
                    };
                    reader.readAsDataURL(event.data);
                }
            };

            // Record in small chunks for real-time transmission
            this.mediaRecorder.start(1000);
            return true;
        } catch (error) {
            console.error('Error starting call:', error);
            return false;
        }
    }

    endCall() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
        }
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.currentCallId) {
            this.socket.emit('leave-call', this.currentCallId);
            this.currentCallId = null;
        }
    }

    setCallbacks(onCallData, onUserJoined, onUserLeft) {
        this.onCallDataCallback = onCallData;
        this.onUserJoinedCallback = onUserJoined;
        this.onUserLeftCallback = onUserLeft;
    }

    isCallActive() {
        return this.currentCallId !== null;
    }
}

export default new CallService();
