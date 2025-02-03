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
  Badge,
} from '@chakra-ui/react';
import SocketService from '../services/SocketService';
import AudioService from '../services/AudioService';

function CallInterface({ isOpen, onClose, onCallStart }) {
  const [roomId, setRoomId] = useState('');
  const [isInitiator, setIsInitiator] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [participants, setParticipants] = useState(new Set());
  const toast = useToast();
  const { onCopy } = useClipboard(roomId);

  // Setup effect - runs when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened - connecting to socket server');
      connectToServer();
    }
    return () => {
      if (!isConnected) {
        console.log('Cleaning up unsuccessful connection');
        SocketService.disconnect();
      }
    };
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
    }
  }, [isConnected]);

  const connectToServer = async () => {
    try {
      await SocketService.connect();
      setupSocketHandlers();
    } catch (error) {
      console.error('Failed to connect to server:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to server. Please try again.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const setupSocketHandlers = () => {
    SocketService.setAudioReceivedCallback((audio, language, userId) => {
      console.log(`Received audio from ${userId} in ${language}`);
      // Handle incoming audio - this will be processed by TranslationService
    });

    SocketService.setTranslationReceivedCallback((data) => {
      console.log('Received translation:', data);
      // Handle incoming translation
    });
  };

  const startCall = async () => {
    console.log('Creating new room as initiator');
    setIsInitiator(true);
    setIsConnecting(true);
    
    try {
      const newRoomId = await SocketService.createRoom();
      setRoomId(newRoomId);
      setIsConnected(true);
      participants.add('You (Host)');
      setParticipants(new Set(participants));
      
      await SocketService.startStreaming();
      
      toast({
        title: 'Room Created',
        description: 'Share the room code with others to join',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to create room:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create room',
        status: 'error',
        duration: 5000,
      });
      setIsConnecting(false);
      setIsInitiator(false);
    }
  };

  const joinCall = async () => {
    if (!joinRoomId) {
      toast({
        title: 'Error',
        description: 'Please enter a room code',
        status: 'error',
      });
      return;
    }

    console.log('Joining room as participant');
    setIsConnecting(true);
    
    try {
      await SocketService.joinRoom(joinRoomId);
      setRoomId(joinRoomId);
      setIsConnected(true);
      participants.add('You');
      setParticipants(new Set(participants));
      
      await SocketService.startStreaming();
      
      toast({
        title: 'Connected!',
        description: 'Successfully joined the room',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to join room:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to join room',
        status: 'error',
        duration: 5000,
      });
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    console.log('Ending call');
    SocketService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    setIsInitiator(false);
    setJoinRoomId('');
    setRoomId('');
    setParticipants(new Set());
    onClose();
  };

  const copyRoomId = () => {
    onCopy();
    toast({
      title: 'Copied!',
      description: 'Room code copied to clipboard',
      status: 'success',
      duration: 2000,
    });
  };

  const renderContent = () => {
    if (isConnected) {
      return (
        <VStack spacing={4} width="100%">
          <Text color="green.500" fontWeight="bold">
            Connected! You can start talking.
          </Text>
          <Text fontSize="sm">Room Code: {roomId}</Text>
          <Text fontSize="sm">Participants:</Text>
          {Array.from(participants).map((participant, index) => (
            <Badge key={index} colorScheme="green">
              {participant}
            </Badge>
          ))}
        </VStack>
      );
    }

    if (!isConnecting && !isConnected) {
      return (
        <HStack width="100%" justifyContent="space-between">
          <Button colorScheme="blue" onClick={startCall}>
            Create New Room
          </Button>
          <Text>or</Text>
          <Button colorScheme="green" onClick={() => setIsConnecting(true)}>
            Join Existing Room
          </Button>
        </HStack>
      );
    }

    if (isConnecting && !isConnected) {
      if (isInitiator) {
        return (
          <VStack width="100%" spacing={4}>
            <Text>Share this room code:</Text>
            <Input value={roomId} isReadOnly />
            <Button onClick={copyRoomId}>
              Copy Room Code
            </Button>
          </VStack>
        );
      }
      return (
        <VStack width="100%" spacing={4}>
          <Text>Enter room code:</Text>
          <Input
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            placeholder="Paste room code here"
          />
          <Button colorScheme="green" onClick={joinCall}>
            Join Room
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