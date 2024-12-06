// src/components/CallInterface.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  useToast,
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { PhoneIcon, WarningIcon } from '@chakra-ui/icons';
import CallService from '../services/CallService';

const CallInterface = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (isModalOpen) {
      console.log('Modal opened - setting up handlers');
      setupCallHandlers();
    }
  }, [isModalOpen]);

  const setupCallHandlers = () => {
    console.log('Setting up call handlers');
    CallService.setCallbacks(
      (original, translated) => {
        setOriginalText(original);
        setTranslatedText(translated);
      },
      (userId) => {
        toast({
          title: 'User Joined',
          description: `User ${userId} joined the call`,
          status: 'info',
          duration: 3000,
        });
      },
      (userId) => {
        toast({
          title: 'User Left',
          description: `User ${userId} left the call`,
          status: 'info',
          duration: 3000,
        });
      }
    );
  };

  const startCall = async () => {
    console.log('Starting call...');
    const callId = 'test-call-' + Math.random().toString(36).substr(2, 9);
    
    try {
      const success = await CallService.startCall(callId);
      if (success) {
        setIsCallActive(true);
        toast({
          title: 'Call Started',
          description: 'You can now speak and see translations',
          status: 'success',
          duration: 3000,
        });
      } else {
        throw new Error('Failed to start call');
      }
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: 'Call Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const endCall = () => {
    CallService.endCall();
    setIsCallActive(false);
    setOriginalText('');
    setTranslatedText('');
    toast({
      title: 'Call Ended',
      status: 'info',
      duration: 3000,
    });
  };

  return (
    <>
      <Button
        leftIcon={<PhoneIcon />}
        colorScheme={isCallActive ? 'red' : 'green'}
        onClick={() => setIsModalOpen(true)}
      >
        {isCallActive ? 'View Active Call' : 'Start New Call'}
      </Button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Translation Call</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Button
                  colorScheme={isCallActive ? 'red' : 'green'}
                  onClick={isCallActive ? endCall : startCall}
                  width="100%"
                  mb={4}
                >
                  {isCallActive ? 'End Call' : 'Start Call'}
                </Button>
              </Box>

              {isCallActive && (
                <Box>
                  <Text fontWeight="bold" mb={2}>Original Text:</Text>
                  <Box p={3} bg="gray.100" borderRadius="md" mb={4}>
                    {originalText || 'Waiting for speech...'}
                  </Box>

                  <Text fontWeight="bold" mb={2}>Translated Text:</Text>
                  <Box p={3} bg="blue.100" borderRadius="md">
                    {translatedText || 'Waiting for translation...'}
                  </Box>
                </Box>
              )}

              {!isCallActive && (
                <Box textAlign="center" p={4}>
                  <WarningIcon w={8} h={8} color="gray.400" mb={3} />
                  <Text color="gray.500">
                    Start a call to begin real-time translation
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CallInterface;