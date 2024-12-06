// src/components/TranslationApp.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Container,
  Heading,
  Card,
  CardBody,
  Switch,
  HStack,
  Badge,
} from '@chakra-ui/react';
import TranslationService from '../services/TranslationService';
import CallInterface from './CallInterface';

function TranslationApp() {
  const [isListening, setIsListening] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState('Albanian');
  const [error, setError] = useState(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [usageStats, setUsageStats] = useState({
    characters: 0,
    requests: 0
  });
  const toast = useToast();

  const handleTranslationResult = useCallback((original, translated) => {
    setConversations(prev => [
      ...prev,
      {
        original,
        translated,
        timestamp: new Date().toLocaleTimeString(),
        direction: currentLanguage === 'Albanian' ? 'Albanian → English' : 'English → Albanian'
      }
    ].slice(-5));

    setUsageStats(prev => ({
      characters: prev.characters + original.length + translated.length,
      requests: prev.requests + 1
    }));
  }, [currentLanguage]);

  const handleError = useCallback((error) => {
    setError(error.toString());
    toast({
      title: 'Error',
      description: error.toString(),
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  useEffect(() => {
    try {
      TranslationService.setCallbacks(
        handleTranslationResult,
        handleError
      );
    } catch (error) {
      setError('Speech recognition not supported in this browser. Please use Chrome.');
    }
  }, [handleTranslationResult, handleError]);

  const toggleListening = async () => {
    try {
      if (isListening) {
        await TranslationService.stopListening();
        setIsListening(false);
      } else {
        setError(null);
        await TranslationService.startListening();
        setIsListening(true);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'Albanian' ? 'English' : 'Albanian';
    setCurrentLanguage(newLang);
    TranslationService.setLanguage(newLang === 'Albanian' ? 'sq-AL' : 'en-US');
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading textAlign="center" mb={4}>
          Albanian Voice Translator
        </Heading>

        <Card>
          <CardBody>
            <HStack justifyContent="space-between" mb={4}>
              <Text>Speaking Language:</Text>
              <HStack>
                <Text color={currentLanguage === 'Albanian' ? 'blue.500' : 'gray.500'}>Albanian</Text>
                <Switch
                  isChecked={currentLanguage === 'English'}
                  onChange={toggleLanguage}
                  colorScheme="blue"
                />
                <Text color={currentLanguage === 'English' ? 'blue.500' : 'gray.500'}>English</Text>
              </HStack>
            </HStack>

            {/* Usage Stats and Call Button */}
            <HStack justifyContent="space-between" mt={4} p={4} bg="gray.50" borderRadius="md">
              <Box>
                <Text fontSize="sm">Characters Translated: {usageStats.characters}</Text>
                <Text fontSize="sm">API Requests: {usageStats.requests}</Text>
              </Box>
              <Button
                colorScheme="purple"
                onClick={() => setIsCallModalOpen(true)}
                isDisabled={isListening}
              >
                Start Call
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {conversations.map((conv, index) => (
          <Card key={index} variant="outline">
            <CardBody>
              <Badge mb={2} colorScheme="blue">{conv.direction}</Badge>
              <Text fontWeight="bold" mb={2}>Original:</Text>
              <Text fontSize="lg" mb={3}>{conv.original}</Text>
              <Text fontWeight="bold" mb={2}>Translated:</Text>
              <Text fontSize="lg">{conv.translated}</Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                {conv.timestamp}
              </Text>
            </CardBody>
          </Card>
        ))}

        {error && (
          <Box bg="red.50" p={4} borderRadius="md">
            <Text color="red.500">{error}</Text>
          </Box>
        )}

        <Button
          size="lg"
          colorScheme={isListening ? 'red' : 'blue'}
          onClick={toggleListening}
          isLoading={isListening}
          loadingText="Listening..."
        >
          {isListening ? 'Stop Listening' : 'Start Recording'}
        </Button>

        <CallInterface
          isOpen={isCallModalOpen}
          onClose={() => {
            setIsCallModalOpen(false);
          }}
          onCallStart={() => {
            setIsListening(true);
          }}
        />
      </VStack>
    </Container>
  );
}

export default TranslationApp;