import React from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Icon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { WarningIcon } from '@chakra-ui/icons';

const CancelPage = () => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    navigate('/', { state: { openSubscription: true } });
  };

  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Icon as={WarningIcon} w={12} h={12} color="orange.500" />
        <Heading>Payment Cancelled</Heading>
        <Text fontSize="xl">
          Your subscription payment was cancelled. No charges were made.
        </Text>
        <VStack spacing={4}>
          <Button colorScheme="blue" size="lg" onClick={handleTryAgain}>
            Try Again
          </Button>
          <Button variant="ghost" onClick={handleReturnHome}>
            Return to Translator
          </Button>
        </VStack>
      </VStack>
    </Container>
  );
};

export default CancelPage;
