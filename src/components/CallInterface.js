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
import { colors, typography } from '../theme';
import { premiumComponents } from '../theme/components';

function CallInterface({ isOpen, onClose, onCallStart, onCallEnd, isInCall }) {
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

  const Modal = ({ children }) => (
    isOpen ? (
      <div className="modal-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
      }}>
        <div className="modal-content premium-card" style={{
          width: '90%',
          maxWidth: '500px',
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(123, 97, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}>
          {children}
        </div>
      </div>
    ) : null
  );

  const renderContent = () => {
    if (isConnected) {
      return (
        <div className="fade-in" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          width: '100%',
        }}>
          <div className="premium-card" style={{
            padding: '16px',
            background: 'rgba(0, 230, 118, 0.05)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span className="material-icons-round" style={{ color: colors.status.success }}>
              wifi_tethering
            </span>
            <div style={{
              fontFamily: typography.fontFamily.premium,
              fontWeight: typography.fontWeights.medium,
              color: colors.status.success,
            }}>
              Connected! You can start talking.
            </div>
          </div>
          
          <div className="premium-card" style={{
            padding: '16px',
            background: 'rgba(123, 97, 255, 0.05)',
            borderRadius: '12px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}>
              <span className="material-icons-round" style={{ color: colors.primary.main }}>
                key
              </span>
              <span style={{
                fontFamily: typography.fontFamily.premium,
                fontWeight: typography.fontWeights.medium,
                color: colors.text.primary,
              }}>Room Code</span>
            </div>
            <div className="premium-input" style={{
              padding: '12px',
              background: 'white',
              borderRadius: '8px',
              fontFamily: typography.fontFamily.premium,
              color: colors.text.primary,
              textAlign: 'center',
              letterSpacing: '2px',
              userSelect: 'all',
              cursor: 'pointer',
            }} onClick={copyRoomId}>
              {roomId}
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: colors.text.secondary,
              fontFamily: typography.fontFamily.premium,
              fontSize: typography.sizes.body2,
            }}>
              <span className="material-icons-round">group</span>
              Participants
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              {Array.from(participants).map((participant, index) => (
                <div key={index} className="quality-badge" style={{
                  background: colors.primary.main,
                  color: '#FFFFFF',
                }}>
                  <span className="material-icons-round">person</span>
                  {participant}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (!isConnecting && !isConnected) {
      return (
        <div className="fade-in" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          alignItems: 'center',
          textAlign: 'center',
        }}>
          <div style={{
            color: colors.text.primary,
            fontFamily: typography.fontFamily.premium,
            fontSize: typography.sizes.body1,
            marginBottom: '16px',
          }}>
            Choose how you want to start
          </div>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            width: '100%',
          }}>
            <button
              className="premium-button premium-card"
              onClick={startCall}
              style={{
                flex: 1,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                background: colors.primary.main,
                color: '#FFFFFF',
              }}
            >
              <span className="material-icons-round" style={{ fontSize: '32px' }}>
                add_circle
              </span>
              Create New Room
            </button>
            
            <button
              className="premium-button premium-card"
              onClick={() => setIsConnecting(true)}
              style={{
                flex: 1,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                background: 'white',
                color: colors.primary.main,
                border: `2px solid ${colors.primary.main}`,
              }}
            >
              <span className="material-icons-round" style={{ fontSize: '32px' }}>
                login
              </span>
              Join Existing
            </button>
          </div>
        </div>
      );
    }

    if (isConnecting && !isConnected) {
      if (isInitiator) {
        return (
          <div className="fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            width: '100%',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: colors.text.primary,
              fontFamily: typography.fontFamily.premium,
              fontWeight: typography.fontWeights.medium,
            }}>
              <span className="material-icons-round">share</span>
              Share this room code with others
            </div>
            
            <div className="premium-card" style={{
              padding: '24px',
              background: 'rgba(123, 97, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'center',
            }}>
              <div className="premium-input" style={{
                padding: '16px',
                textAlign: 'center',
                letterSpacing: '2px',
                fontSize: typography.sizes.h4,
                fontWeight: typography.fontWeights.medium,
                userSelect: 'all',
              }}>
                {roomId}
              </div>
              
              <button
                className="premium-button"
                onClick={copyRoomId}
                style={{
                  ...premiumComponents.Button.base,
                  ...premiumComponents.Button.premium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span className="material-icons-round">content_copy</span>
                Copy Room Code
              </button>
            </div>
          </div>
        );
      }
      
      return (
        <div className="fade-in" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          width: '100%',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text.primary,
            fontFamily: typography.fontFamily.premium,
            fontWeight: typography.fontWeights.medium,
          }}>
            <span className="material-icons-round">input</span>
            Enter the room code to join
          </div>
          
          <input
            className="premium-input"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            placeholder="Paste room code here"
            style={{
              fontSize: typography.sizes.h4,
              textAlign: 'center',
              letterSpacing: '2px',
            }}
          />
          
          <button
            className="premium-button"
            onClick={joinCall}
            style={{
              ...premiumComponents.Button.base,
              ...premiumComponents.Button.premium,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span className="material-icons-round">login</span>
            Join Room
          </button>
        </div>
      );
    }
  };

  return (
    <Modal>
      <div style={{ padding: '32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}>
          <h2 style={{
            fontFamily: typography.fontFamily.premium,
            fontSize: typography.sizes.h3,
            fontWeight: typography.fontWeights.bold,
            background: colors.premium.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Translation Call
          </h2>
          
          <button
            className="premium-button"
            onClick={endCall}
            style={{
              width: '36px',
              height: '36px',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.05)',
              color: colors.text.secondary,
              '&:hover': {
                background: 'rgba(0,0,0,0.1)',
                color: colors.text.primary,
              }
            }}
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>
          {renderContent()}
        </div>

        {isConnected && (
          <div style={{
            marginTop: '32px',
            display: 'flex',
            justifyContent: 'center',
          }}>
            <button
              className="premium-button"
              onClick={endCall}
              style={{
                ...premiumComponents.Button.base,
                background: colors.status.error,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="material-icons-round">call_end</span>
              End Call
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default CallInterface;