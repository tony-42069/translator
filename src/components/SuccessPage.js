import React, { useEffect, useState } from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PaymentService from '../services/PaymentService';

const SuccessPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          throw new Error('No session ID found');
        }

        // Here you would typically verify the session with your backend
        const subscription = await PaymentService.getCurrentSubscription();
        
        toast({
          title: 'Subscription Active',
          description: 'Your subscription has been successfully activated!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Verification error:', error);
        toast({
          title: 'Verification Error',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifySubscription();
  }, [searchParams, toast]);

  const handleReturnHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <Container centerContent py={20}>
        <Spinner size="xl" />
        <Text mt={4}>Verifying your subscription...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Heading color="green.500">Thank You!</Heading>
        <Text fontSize="xl">
          Your subscription has been successfully activated. You now have full access to all features.
        </Text>
        <Button colorScheme="blue" size="lg" onClick={handleReturnHome}>
          Return to Translator
        </Button>
      </VStack>
    </Container>
  );
};

export default SuccessPage;
