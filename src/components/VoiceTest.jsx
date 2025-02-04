// src/components/VoiceTest.jsx
import React, { useState } from 'react';
import { Button, VStack, Text, Box } from '@chakra-ui/react';

const VoiceTest = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'sq-AL'; // Albanian
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
      console.log('Speech recognition started');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
      console.log('Transcript:', transcriptText);
    };

    recognition.onerror = (event) => {
      setError(`Error: ${event.error}`);
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Speech recognition ended');
    };

    recognition.start();
  };

  const testTTS = async () => {
    if (!transcript) return;

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.REACT_APP_ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: transcript,
          model_id: 'eleven_multilingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) throw new Error('TTS request failed');

      const audioBlob = await response.blob();
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
    } catch (err) {
      setError(`TTS Error: ${err.message}`);
      console.error('TTS error:', err);
    }
  };

  return (
    <VStack spacing={4} p={5}>
      <Button 
        colorScheme={isListening ? 'red' : 'blue'}
        onClick={startListening}
      >
        {isListening ? 'Listening...' : 'Start Speech Test'}
      </Button>

      <Button
        colorScheme="green"
        onClick={testTTS}
        isDisabled={!transcript}
      >
        Play TTS
      </Button>

      <Box p={4} borderWidth={1} borderRadius="md" width="100%">
        <Text fontWeight="bold">Transcript:</Text>
        <Text>{transcript || 'No transcript yet...'}</Text>
      </Box>

      {error && (
        <Box p={4} bg="red.100" borderRadius="md" width="100%">
          <Text color="red.500">{error}</Text>
        </Box>
      )}
    </VStack>
  );
};

export default VoiceTest;