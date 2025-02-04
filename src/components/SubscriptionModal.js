import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
} from '@chakra-ui/react';
import PaymentService from '../services/PaymentService';
import PricingPlans from './PricingPlans';

const SubscriptionModal = ({ isOpen, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const handleSelectPlan = async (plan) => {
    try {
      setIsProcessing(true);
      await PaymentService.createSubscription(plan.priceId);
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process subscription',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Choose Your Plan</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <PricingPlans 
            onSelectPlan={handleSelectPlan} 
            isProcessing={isProcessing} 
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SubscriptionModal;
