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
  useDisclosure,
} from '@chakra-ui/react';
import TranslationService from '../services/TranslationService';
import SocketService from '../services/SocketService';
import AudioService from '../services/AudioService';
import PaymentService from '../services/PaymentService';
import CallInterface from './CallInterface';
import SubscriptionModal from './SubscriptionModal';
import Dashboard from './Dashboard';
import { colors, typography } from '../theme';
import { premiumComponents } from '../theme/components';
import '../styles/global.css';

function TranslationApp() {
  const { isOpen: isSubscriptionOpen, onOpen: onSubscriptionOpen, onClose: onSubscriptionClose } = useDisclosure();
  const [subscription, setSubscription] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState('Albanian');
  const [error, setError] = useState(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
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

    // If in a call, send translation to other participants
    if (isInCall) {
      SocketService.socket?.emit('translation-result', {
        roomId: SocketService.roomId,
        originalText: original,
        translatedText: translated,
        targetLanguage: currentLanguage === 'Albanian' ? 'en-US' : 'sq-AL'
      });
    }
  }, [currentLanguage, isInCall]);

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

      // Set up socket handlers for translations
      SocketService.setTranslationReceivedCallback((data) => {
        const { originalText, translatedText, targetLanguage } = data;
        setConversations(prev => [
          ...prev,
          {
            original: originalText,
            translated: translatedText,
            timestamp: new Date().toLocaleTimeString(),
            direction: targetLanguage === 'en-US' ? 'Albanian → English' : 'English → Albanian'
          }
        ].slice(-5));
      });

      // Set up socket handlers for audio
      SocketService.setAudioReceivedCallback(async (audio, language) => {
        try {
          const result = await TranslationService.processAudioStream(
            audio,
            language,
            currentLanguage === 'Albanian' ? 'en-US' : 'sq-AL'
          );
          handleTranslationResult(result.original, result.translated);
        } catch (error) {
          handleError(error);
        }
      });
    } catch (error) {
      setError('Speech recognition not supported in this browser. Please use Chrome.');
    }
  }, [handleTranslationResult, handleError, currentLanguage]);

  const toggleListening = async () => {
    try {
      if (isListening) {
        if (isInCall) {
          await AudioService.stopProcessing();
        } else {
          await TranslationService.stopListening();
        }
        setIsListening(false);
      } else {
        setError(null);
        if (isInCall) {
          await SocketService.startStreaming();
        } else {
          await TranslationService.startListening();
        }
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

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const sub = await PaymentService.getCurrentSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };
    checkSubscription();
  }, []);

  const handleCallStart = () => {
    if (!subscription?.subscription) {
      onSubscriptionOpen();
      return;
    }
    setIsInCall(true);
    setIsListening(true);
  };

  const handleCallEnd = () => {
    setIsInCall(false);
    setIsListening(false);
    setIsCallModalOpen(false);
  };

  const getTierFromSubscription = (sub) => {
    if (!sub?.subscription) return 'basic';
    const planNickname = sub.subscription.plan.nickname?.toLowerCase() || '';
    if (planNickname.includes('elite')) return 'elite';
    if (planNickname.includes('freedom')) return 'premium';
    return 'basic';
  };

  return (
    <Dashboard userTier={getTierFromSubscription(subscription)}>
      <div className="fade-in" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        {/* Language Toggle */}
        <div className="premium-card slide-in" style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span className="material-icons-round" style={{ color: colors.primary.main }}>
            translate
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            <span style={{
              color: currentLanguage === 'Albanian' ? colors.primary.main : colors.text.secondary,
              fontFamily: typography.fontFamily.premium,
              fontWeight: typography.fontWeights.medium,
              transition: 'all 0.3s ease',
            }}>Albanian</span>
            
            <div 
              className={`switch-track ${currentLanguage === 'English' ? 'active' : ''}`}
              onClick={toggleLanguage}
            >
              <div className="switch-thumb" />
            </div>
            
            <span style={{
              color: currentLanguage === 'English' ? colors.primary.main : colors.text.secondary,
              fontFamily: typography.fontFamily.premium,
              fontWeight: typography.fontWeights.medium,
              transition: 'all 0.3s ease',
            }}>English</span>
          </div>
        </div>

        {/* Usage Stats and Call Button */}
        <div className="premium-card slide-in" style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div className="material-icons-round" style={{
              color: colors.primary.main,
              fontSize: '24px'
            }}>
              analytics
            </div>
            <div>
              <div style={{
                fontFamily: typography.fontFamily.premium,
                color: colors.text.primary,
                fontSize: typography.sizes.body2,
                marginBottom: '4px',
              }}>
                {usageStats.characters.toLocaleString()} Characters Translated
              </div>
              <div style={{
                fontFamily: typography.fontFamily.premium,
                color: colors.text.secondary,
                fontSize: typography.sizes.caption,
              }}>
                {usageStats.requests} API Requests
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className={`quality-badge ${subscription?.subscription ? 'premium-card' : ''}`} style={{
              background: subscription?.subscription ? colors.status.success : colors.status.warning,
              color: '#FFFFFF',
            }}>
              <span className="material-icons-round">
                {subscription?.subscription ? 'verified' : 'timer'}
              </span>
              {subscription?.subscription ? 
                (subscription.subscription.plan.nickname || 'Active Subscription') : 
                'Free Trial'}
            </div>
            
            <button
              className="premium-button"
              onClick={() => setIsCallModalOpen(true)}
              disabled={isListening && !isInCall}
              style={{
                ...premiumComponents.Button.base,
                ...premiumComponents.Button.premium,
                opacity: (isListening && !isInCall) ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="material-icons-round">
                {isInCall ? 'phone_in_talk' : 'add_ic_call'}
              </span>
              {isInCall ? 'Current Call' : 'Start Call'}
            </button>
          </div>
        </div>

        {/* Conversations */}
        <div className="fade-in" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}>
          {conversations.map((conv, index) => (
            <div key={index} className="conversation-card premium-card" style={{
              padding: '32px',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
            }}>
              <div className="conversation-direction" style={{
                background: colors.primary.main,
                color: '#FFFFFF',
              }}>
                <span className="material-icons-round" style={{ fontSize: '14px', marginRight: '4px' }}>
                  swap_horiz
                </span>
                {conv.direction}
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}>
                  <span className="material-icons-round" style={{ color: colors.text.secondary }}>
                    record_voice_over
                  </span>
                  <span style={{
                    fontFamily: typography.fontFamily.premium,
                    fontWeight: typography.fontWeights.semibold,
                    color: colors.text.primary,
                  }}>Original</span>
                </div>
                <div style={{
                  fontSize: typography.sizes.body1,
                  color: colors.text.primary,
                  lineHeight: 1.6,
                  marginBottom: '24px',
                  padding: '16px',
                  background: 'rgba(123, 97, 255, 0.05)',
                  borderRadius: '12px',
                }}>{conv.original}</div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}>
                  <span className="material-icons-round" style={{ color: colors.text.secondary }}>
                    translate
                  </span>
                  <span style={{
                    fontFamily: typography.fontFamily.premium,
                    fontWeight: typography.fontWeights.semibold,
                    color: colors.text.primary,
                  }}>Translated</span>
                </div>
                <div style={{
                  fontSize: typography.sizes.body1,
                  color: colors.text.primary,
                  lineHeight: 1.6,
                  padding: '16px',
                  background: 'rgba(0, 255, 148, 0.05)',
                  borderRadius: '12px',
                }}>{conv.translated}</div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '16px',
                  color: colors.text.secondary,
                  fontSize: typography.sizes.caption,
                }}>
                  <span className="material-icons-round" style={{ fontSize: '14px' }}>schedule</span>
                  {conv.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="premium-card slide-in" style={{
            padding: '16px',
            background: 'rgba(255, 23, 68, 0.05)',
            borderLeft: `4px solid ${colors.status.error}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span className="material-icons-round" style={{ color: colors.status.error }}>
              error_outline
            </span>
            <span style={{
              fontFamily: typography.fontFamily.premium,
              color: colors.status.error,
            }}>
              {error}
            </span>
          </div>
        )}

        {/* Recording Button */}
        <button
          className="premium-button"
          onClick={toggleListening}
          style={{
            ...premiumComponents.Button.base,
            ...premiumComponents.Button.primary,
            width: '100%',
            marginTop: '16px',
            backgroundColor: isListening ? colors.status.error : colors.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            height: '56px',
          }}
        >
          {isListening && <span className="recording-indicator" />}
          <span className="material-icons-round">
            {isListening ? 'mic_off' : 'mic'}
          </span>
          {isListening ? 'Stop Listening' : 'Start Recording'}
        </button>
      </div>

      {/* Modals */}
      <CallInterface
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        onCallStart={handleCallStart}
        onCallEnd={handleCallEnd}
        isInCall={isInCall}
      />
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={onSubscriptionClose}
      />
    </Dashboard>
  );
}

export default TranslationApp;
