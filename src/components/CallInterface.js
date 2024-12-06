// src/components/CallInterface.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useClipboard,
} from '@chakra-ui/react';
import WebRTCService from '../services/WebRTCService';

function CallInterface({ isOpen, onClose, onCallStart }) {
  const [connectionId, setConnectionId] = useState('');
  const [isInitiator, setIsInitiator] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [peerCode, setPeerCode] = useState('');
  const audioRef = useRef(null);
  const toast = useToast();
  const { onCopy } = useClipboard(connectionId);

  // Setup effect - runs when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened - setting up handlers');
      setupCallHandlers();
    }
  }, [isOpen]);

  // Connection status effect
  useEffect(() => {
    if (isConnected) {
      console.log('Connection established - transitioning to translation');
      toast({
        title: 'Connected!',
        description: 'You can start talking now',
        status: 'success',
        duration: 3000,
      });
      onCallStart();
      onClose();
    }
  }, [isConnected]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (!isConnected) {
        console.log('Cleaning up unsuccessful connection');
        WebRTCService.cleanup();
      }
    };
  }, [isConnected]);

  const setupCallHandlers = () => {
    console.log('Setting up call handlers');
    WebRTCService.setCallbacks(
      // Connection signal callback
      (signal) => {
        console.log('Got connection signal');
        setConnectionId(signal);
      },
      // Data callback
      (data) => {
        console.log('Received data:', data);
        const parsedData = JSON.parse(data);
        if (parsedData.type === 'translation') {
          // Handle translation data
          console.log('Received translation:', parsedData.text);
        }
      },
      // Stream callback
      (stream) => {
        console.log('Received audio stream');
        const audio = new Audio();
        audio.srcObject = stream;
        audio.play().catch(console.error);
      },
      // Error callback
      (error) => {
        console.error('WebRTC error:', error);
        toast({
          title: 'Connection Error',
          description: error.message,
          status: 'error',
          duration: 5000,
        });
      },
      // Connected callback
      () => {
        console.log('Connection established!');
        toast({
          title: 'Connected!',
          description: 'Call connection established successfully',
          status: 'success',
          duration: 3000,
        });
        onCallStart();
      }
    );
  };

  const startCall = async () => {
    console.log('Starting new call as initiator');
    setIsInitiator(true);
    setIsConnecting(true);
    
    const success = await WebRTCService.initialize(true);
    if (success) {
      toast({
        title: 'Call Started',
        description: 'Share the connection code with the other person',
        status: 'success',
        duration: 3000,
      });
    } else {
      setIsConnecting(false);
      setIsInitiator(false);
    }
  };

  const joinCall = async () => {
    if (!peerCode) {
      toast({
        title: 'Error',
        description: 'Please enter a connection code',
        status: 'error',
      });
      return;
    }

    console.log('Joining call as peer');
    setIsConnecting(true);
    
    try {
      const success = await WebRTCService.initialize(false);
      if (success) {
        console.log('Initialized peer, attempting connection');
        await WebRTCService.connect(peerCode);
        toast({
          title: 'Connected!',
          description: 'Successfully joined the call',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to join call:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to establish connection',
        status: 'error',
        duration: 5000,
      });
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    console.log('Ending call');
    if (!isConnected) {
      WebRTCService.cleanup();
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsInitiator(false);
    setPeerCode('');
    setConnectionId('');
    onClose();
  };

  const copyConnectionId = () => {
    onCopy();
    toast({
      title: 'Copied!',
      description: 'Connection code copied to clipboard',
      status: 'success',
      duration: 2000,
    });
  };

  const renderContent = () => {
    if (isConnected) {
      return (
        <Text color="green.500" fontWeight="bold">
          Connected! You can start talking.
        </Text>
      );
    }

    if (!isConnecting && !isConnected) {
      return (
        <HStack width="100%" justifyContent="space-between">
          <Button colorScheme="blue" onClick={startCall}>
            Start New Call
          </Button>
          <Text>or</Text>
          <Button colorScheme="green" onClick={() => setIsConnecting(true)}>
            Join Existing Call
          </Button>
        </HStack>
      );
    }

    if (isConnecting && !isConnected) {
      if (isInitiator) {
        return (
          <VStack width="100%" spacing={4}>
            <Text>Share this connection code:</Text>
            <Input value={connectionId} isReadOnly />
            <Button onClick={copyConnectionId}>
              Copy Connection Code
            </Button>
          </VStack>
        );
      }
      return (
        <VStack width="100%" spacing={4}>
          <Text>Enter connection code:</Text>
          <Input
            value={peerCode}
            onChange={(e) => setPeerCode(e.target.value)}
            placeholder="Paste connection code here"
          />
          <Button colorScheme="green" onClick={joinCall}>
            Join Call
          </Button>
        </VStack>
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={endCall} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Start Translation Call</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            {renderContent()}
          </VStack>
          <audio ref={audioRef} autoPlay playsInline />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" onClick={endCall}>
            End Call
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CallInterface;