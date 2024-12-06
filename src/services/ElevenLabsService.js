// src/services/ElevenLabsService.js

class ElevenLabsService {
  constructor() {
    this.API_KEY = 'sk_9580cf8a87cd2ba112a7757a091d2300eb75e20776616553';
    this.API_URL = 'https://api.elevenlabs.io/v1';
    this.voice_id = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice
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

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();

    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }

  // Get available voices (useful for later)
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