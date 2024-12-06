// src/services/TranslationService.js
import ElevenLabsService from './ElevenLabsService';

class TranslationService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.currentLanguage = 'sq-AL'; // Default to Albanian
    this.GOOGLE_API_KEY = 'AIzaSyBlVHAy0773a8uZNPryEMAQ0Dzp7ZwRFPI';
    this.lastProcessedText = '';
    this.processingQueue = [];
    this.isProcessing = false;
  }

  initialize() {
    if (!('webkitSpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported. Please use Chrome.');
    }

    this.recognition = new window.webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.currentLanguage;

    this.recognition.onresult = async (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal && transcript !== this.lastProcessedText) {
          this.lastProcessedText = transcript;
          await this.handleSpeechResult(transcript);
        }
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition.start();
      }
    };

    this.recognition.onerror = (event) => {
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };
  }

  async startListening() {
    if (!this.recognition) {
      this.initialize();
    }

    this.isListening = true;
    try {
      await this.recognition.start();
    } catch (error) {
      console.log('Restarting recognition...');
      this.recognition.stop();
      setTimeout(() => this.recognition.start(), 100);
    }
  }

  async stopListening() {
    this.isListening = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  setLanguage(language) {
    this.currentLanguage = language;
    if (this.recognition) {
      const oldRecognition = this.recognition;
      oldRecognition.stop();
      this.recognition = null;
      this.initialize();
      if (this.isListening) {
        this.startListening();
      }
    }
  }

  async translate(text, sourceLang, targetLang) {
    try {
      console.log(`Translating from ${sourceLang} to ${targetLang}: ${text}`);
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${this.GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: 'text'
          })
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Translation failed');
      }

      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  async processQueue() {
    if (this.isProcessing || this.processingQueue.length === 0) return;

    this.isProcessing = true;
    const text = this.processingQueue.shift();

    try {
      // Determine translation direction based on current language
      const sourceLang = this.currentLanguage === 'sq-AL' ? 'sq' : 'en';
      const targetLang = this.currentLanguage === 'sq-AL' ? 'en' : 'sq';
      
      const translatedText = await this.translate(text, sourceLang, targetLang);
      await ElevenLabsService.textToSpeech(translatedText, targetLang);

      if (this.onResultCallback) {
        this.onResultCallback(text, translatedText);
      }
    } catch (error) {
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    } finally {
      this.isProcessing = false;
      if (this.processingQueue.length > 0) {
        this.processQueue();
      }
    }
  }

  async handleSpeechResult(text) {
    this.processingQueue.push(text);
    this.processQueue();
  }

  setCallbacks(onResult, onError) {
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
  }
}

export default new TranslationService();