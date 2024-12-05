// src/services/ElevenLabsService.js
import Sound from 'react-native-sound';

class ElevenLabsService {
  constructor() {
    this.API_KEY = 'sk_9580cf8a87cd2ba112a7757a091d2300eb75e20776616553';
    this.API_URL = 'https://api.elevenlabs.io/v1';
    this.voice_id = '21m00Tcm4TlvDq8ikWAM'; // Default voice ID - Rachel
  }

  async textToSpeech(text, language = 'en') {
    try {
      const response = await fetch(
        `${this.API_URL}/text-to-speech/${this.voice_id}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.API_KEY,
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('TTS request failed');
      }

      const blob = await response.blob();
      return await this.playAudioBlob(blob);

    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }

  async playAudioBlob(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64data = reader.result.split(',')[1];
        
        // Save the audio file temporarily
        const audioPath = Sound.MAIN_BUNDLE + '/temp_audio.mp3';
        
        // Write base64 to file and play it
        const sound = new Sound(audioPath, '', (error) => {
          if (error) {
            reject(error);
            return;
          }
          
          sound.play((success) => {
            sound.release();
            resolve(success);
          });
        });
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Add method to get available voices
  async getVoices() {
    try {
      const response = await fetch(`${this.API_URL}/voices`, {
        headers: {
          'xi-api-key': this.API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get voices:', error);
      throw error;
    }
  }
}

export default new ElevenLabsService();